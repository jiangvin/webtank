package com.integration.socket.service;

import com.integration.dto.room.GameStatusDto;
import com.integration.socket.model.Constant;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.dto.RankDto;
import com.integration.socket.model.dto.UserDto;
import com.integration.socket.repository.dao.UserDao;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/13
 */

@Service
@Slf4j
public class UserService {

    private static final int MAX_RANK_LIMIT = 10;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserDao userDao;

    public UserDto queryUser(String userId) {
        UserRecord userRecord = userDao.queryUser(userId);
        if (userRecord == null) {
            return null;
        }
        userDao.updateLoginTime(userRecord);
        UserDto userDto = UserDto.convert(userRecord);

        //查询排名
        userDto.setRank(userDao.queryRankFromUserId(userId));
        return userDto;
    }

    public void saveUser(UserDto userDto) {
        userDao.saveUser(userDto);
    }

    public List<RankDto> getRankList(int start, int limit) {
        if (limit > MAX_RANK_LIMIT) {
            limit = MAX_RANK_LIMIT;
        }

        return RankDto.convert(userDao.queryRankList(start, limit));
    }

    public int getRank(int score) {
        return userDao.queryRank(score);
    }

    public void saveStageForSinglePlayer(UserDto userDto) {
        UserRecord userRecord = userDao.queryUser(userDto.getUserId());
        if (userRecord.getStage() < userDto.getStage()) {
            userRecord.setStage(userDto.getStage());
            userRecord.update();
        }
    }

    public void saveRankForSinglePlayer(RankDto rankDto) {
        //幂等性检测
        if (!tokenService.checkToken(rankDto.getToken())) {
            return;
        }

        if (StringUtils.isEmpty(rankDto.getUsername()) || rankDto.getScore() == null || rankDto.getScore() <= 0) {
            return;
        }

        //返回金币奖励
        saveCoinFromScore(userDao.queryUser(rankDto.getUserId()), rankDto.getScore(), true);

        Integer maxScore = userDao.queryMaxScore(rankDto.getUserId(), rankDto.getUsername());
        if (maxScore != null && maxScore > rankDto.getScore()) {
            return;
        }

        //更新后面的排名
        int rank = getRank(rankDto.getScore());
        userDao.updateBoardRank(rank);

        //插入数据
        rankDto.setRank(rank);
        rankDto.setGameType(0);
        userDao.insertRank(rankDto);
    }

    public void saveRankForMultiplePlayers(UserBo creator, GameStatusDto gameStatusDto) {
        if (gameStatusDto.getScore() <= 0) {
            return;
        }

        Integer maxScore = userDao.queryMaxScore(creator.getUserId(), creator.getUsername());
        if (maxScore != null && maxScore > gameStatusDto.getScore()) {
            return;
        }

        //更新后面的排名
        userDao.updateBoardRank(gameStatusDto.getRank());

        //插入数据
        RankDto rankDto = new RankDto();
        rankDto.setGameType(1);
        rankDto.setRank(gameStatusDto.getRank());
        rankDto.setScore(gameStatusDto.getScore());
        rankDto.setUserId(creator.getUserId());
        rankDto.setUsername(creator.getUsername());
        userDao.insertRank(rankDto);
    }

    public void saveCoinFromScore(UserRecord record, int score, boolean isSingle) {
        if (record == null) {
            return;
        }

        int coin = score / Constant.SCORE_TO_COIN;

        record.setCoin(record.getCoin() + coin);
        if (isSingle) {
            record.setSingleGameTimes(record.getSingleGameTimes() + 1);
        } else {
            record.setNetGameTimes(record.getNetGameTimes() + 1);
        }
        record.update();
    }
}

package com.integration.socket.service;

import com.integration.dto.room.GameStatusDto;
import com.integration.socket.model.Constant;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.dto.RankDto;
import com.integration.socket.model.dto.UserDto;
import com.integration.socket.repository.dao.UserDao;
import com.integration.socket.repository.jooq.tables.records.RankBoardRecord;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
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

        //查询排名和积分
        RankBoardRecord record = userDao.queryFirstRank(userId, null);
        if (record != null) {
            userDto.setRank(record.getRank());
            userDto.setScore(record.getScore());
        }
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

        RankBoardRecord rankBoardRecord = userDao.queryFirstRank(rankDto.getUserId(), rankDto.getUsername());
        if (rankBoardRecord != null && rankBoardRecord.getScore() > rankDto.getScore()) {
            return;
        }

        //更新
        int rank = getRank(rankDto.getScore());
        rankDto.setRank(rank);
        rankDto.setGameType(0);

        if (rankBoardRecord != null) {
            userDao.updateBoardRank(rank, rankBoardRecord.getRank());
            BeanUtils.copyProperties(rankDto, rankBoardRecord);
            rankBoardRecord.update();
        } else {
            userDao.updateBoardRank(rank, null);
            userDao.insertRank(rankDto);
        }
    }

    public void saveRankForMultiplePlayers(UserBo creator, GameStatusDto gameStatusDto) {
        if (gameStatusDto.getScore() <= 0) {
            return;
        }

        RankBoardRecord rankBoardRecord = userDao.queryFirstRank(creator.getUserId(), creator.getUsername());
        if (rankBoardRecord != null && rankBoardRecord.getScore() > gameStatusDto.getScore()) {
            return;
        }

        //更新
        RankDto rankDto = new RankDto();
        rankDto.setGameType(1);
        rankDto.setRank(gameStatusDto.getRank());
        rankDto.setScore(gameStatusDto.getScore());
        rankDto.setUserId(creator.getUserId());
        rankDto.setUsername(creator.getUsername());

        if (rankBoardRecord != null) {
            userDao.updateBoardRank(gameStatusDto.getRank(), rankBoardRecord.getRank());
            BeanUtils.copyProperties(rankDto, rankBoardRecord);
            rankBoardRecord.update();
        } else {
            userDao.updateBoardRank(gameStatusDto.getRank(), null);
            userDao.insertRank(rankDto);
        }
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

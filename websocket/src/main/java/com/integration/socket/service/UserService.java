package com.integration.socket.service;

import com.integration.dto.room.GameStatusDto;
import com.integration.socket.model.bo.UserBo;
import com.integration.socket.model.dto.RankDto;
import com.integration.socket.model.dto.StarDto;
import com.integration.socket.model.dto.UserDto;
import com.integration.socket.repository.dao.UserDao;
import com.integration.socket.repository.jooq.tables.records.RankBoardRecord;
import com.integration.socket.repository.jooq.tables.records.StarRecord;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
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

        //查询星数
        userDto.setStar(userDao.queryStarCount(userId));

        return userDto;
    }

    public UserDto updateUser(UserDto userDto) {
        UserRecord userRecord = userDao.queryUser(userDto.getUserId());
        if (userRecord == null) {
            return null;
        }

        //only allow update username and skin
        if (StringUtils.hasText(userDto.getUsername())) {
            userRecord.setUsername(userDto.getUsername());
        }
        if (!StringUtils.isEmpty(userDto.getSkinType())) {
            userRecord.setSkinType(userDto.getSkinType());
        }
        userRecord.update();
        return UserDto.convert(userRecord);
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

    public List<StarDto> getStarInfo(String userId) {
        List<StarRecord> records = userDao.queryStarInfo(userId);

        List<StarDto> dtoList = new ArrayList<>();
        for (StarRecord record : records) {
            dtoList.add(StarDto.convert(record));
        }
        return dtoList;
    }

    public int getRank(int score) {
        return userDao.queryRank(score);
    }

    public UserDto saveStageForSinglePlayer(UserDto userDto) {
        UserRecord userRecord = userDao.queryUser(userDto.getUserId());
        if (userRecord == null) {
            return null;
        }
        if (userRecord.getStage() < userDto.getStage()) {
            userRecord.setStage(userDto.getStage());
            if (userRecord.getHardStage() == 0) {
                userRecord.setHardStage(1);
            }
        }
        if (userRecord.getHardStage() < userDto.getHardStage()) {
            userRecord.setHardStage(userDto.getHardStage());
        }
        userRecord.update();
        return UserDto.convert(userRecord);
    }

    public void saveRankForSinglePlayer(RankDto rankDto) {
        if (StringUtils.isEmpty(rankDto.getUsername()) || rankDto.getScore() == null || rankDto.getScore() <= 0) {
            return;
        }

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

    public UserDto saveStarForSinglePlayer(StarDto starDto) {
        if (!tokenService.checkToken(starDto.getToken())) {
            return null;
        }

        return saveStarForMultiplePlayers(starDto);
    }

    public UserDto saveStarForMultiplePlayers(StarDto starDto) {
        UserRecord userRecord = userDao.queryUser(starDto.getUserId());
        if (userRecord == null) {
            return null;
        }

        boolean isFirstTime = userDao.saveStar(starDto);

        //第一次获得星星可以得满金币，否则只能获得1枚金币
        userRecord.setCoin(userRecord.getCoin() + (isFirstTime ? starDto.getStar() : 1));
        userRecord.update();
        return UserDto.convert(userRecord);
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
}

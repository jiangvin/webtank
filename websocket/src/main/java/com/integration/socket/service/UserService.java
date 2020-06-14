package com.integration.socket.service;

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
    private UserDao userDao;

    public UserDto queryUser(String userId) {
        UserRecord userRecord = userDao.query(userId);
        if (userRecord == null) {
            return null;
        }
        userDao.updateLoginTime(userRecord);
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

    public int getRank(int score) {
        return userDao.queryRank(score);
    }

    public void saveRank(RankDto rankDto) {
        if (StringUtils.isEmpty(rankDto.getUsername()) ||
                rankDto.getScore() == null ||
                rankDto.getScore() <= 0) {
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
}

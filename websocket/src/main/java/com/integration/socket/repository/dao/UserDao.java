package com.integration.socket.repository.dao;

import com.integration.socket.model.dto.RankDto;
import com.integration.socket.model.dto.UserDto;
import com.integration.socket.repository.jooq.tables.records.RankBoardRecord;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import org.jooq.impl.DSL;
import org.springframework.beans.BeanUtils;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.sql.Timestamp;
import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/13
 */

@Repository
public class UserDao extends BaseDao {
    public UserRecord queryUser(String userId) {
        if (StringUtils.isEmpty(userId)) {
            return null;
        }
        return create.selectFrom(USER).where(USER.USER_ID.eq(userId)).fetchOne();
    }

    @Async
    public void updateLoginTime(UserRecord userRecord) {
        userRecord.setLastLoginTime(new Timestamp(System.currentTimeMillis()));
        userRecord.update();
    }

    public void saveUser(UserDto userDto) {
        UserRecord userRecord = create.newRecord(USER);
        userRecord.setUserId(userDto.getUserId());
        userRecord.setUsername(userDto.getUsername());
        userRecord.setUserDevice(userDto.getUserDevice());
        userRecord.setCreateTime(new Timestamp(System.currentTimeMillis()));
        userRecord.setLastLoginTime(userRecord.getCreateTime());
        userRecord.insert();
    }

    public List<RankBoardRecord> queryRankList(int start, int limit) {
        return create.selectFrom(RANK_BOARD).orderBy(RANK_BOARD.RANK, RANK_BOARD.CREATE_TIME.desc()).limit(start, limit).fetch();
    }

    public int queryRank(int score) {
        Integer rank = create.select(RANK_BOARD.RANK).from(RANK_BOARD)
                       .where(RANK_BOARD.SCORE.gt(score))
                       .orderBy(RANK_BOARD.SCORE).limit(1).fetchOneInto(Integer.class);
        return rank == null ? 1 : rank + 1;
    }

    public Integer queryMaxScore(String userId, String username) {
        if (StringUtils.isEmpty(userId)) {
            return create.select(DSL.max(RANK_BOARD.SCORE)).from(RANK_BOARD)
                   .where(RANK_BOARD.USER_ID.isNull().and(RANK_BOARD.USERNAME.eq(username)))
                   .fetchOneInto(Integer.class);
        } else {
            return create.select(DSL.max(RANK_BOARD.SCORE)).from(RANK_BOARD)
                   .where(RANK_BOARD.USER_ID.eq(userId))
                   .fetchOneInto(Integer.class);
        }
    }

    public Integer queryRankFromUserId(String userId) {
        return create.select(DSL.min(RANK_BOARD.RANK)).from(RANK_BOARD)
               .where(RANK_BOARD.USER_ID.eq(userId)).fetchOneInto(Integer.class);
    }

    public void updateBoardRank(int rank) {
        create.execute(String.format("update rank_board rb set rb.rank = rb.rank + 1 where rb.rank >= %d;", rank));
    }

    public void insertRank(RankDto rankDto) {
        RankBoardRecord record = create.newRecord(RANK_BOARD);
        BeanUtils.copyProperties(rankDto, record);
        record.insert();
    }
}

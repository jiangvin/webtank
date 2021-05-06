package com.integration.socket.repository.dao;

import com.integration.socket.model.dto.RankDto;
import com.integration.socket.model.dto.StarDto;
import com.integration.socket.model.dto.UserDto;
import com.integration.socket.repository.jooq.tables.records.RankBoardRecord;
import com.integration.socket.repository.jooq.tables.records.StarRecord;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import com.integration.util.time.TimeUtil;
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
        if (queryUser(userDto.getUserId()) != null) {
            return;
        }

        UserRecord userRecord = create.newRecord(USER);
        userRecord.setUserId(userDto.getUserId());
        userRecord.setUsername(userDto.getUsername());
        userRecord.setUserDevice(userDto.getUserDevice());
        userRecord.setCreateTime(new Timestamp(System.currentTimeMillis()));
        userRecord.setLastLoginTime(userRecord.getCreateTime());

        //新用户道具奖励
        userRecord.setGhostExpired(TimeUtil.after(3));
        userRecord.setRedStarExpired(TimeUtil.after(3));
        userRecord.setClockExpired(TimeUtil.after(3));
        userDto.setGhostExpired(TimeUtil.after(3));
        userDto.setRedStarExpired(TimeUtil.after(3));
        userDto.setClockExpired(TimeUtil.after(3));

        userRecord.insert();
    }

    public List<StarRecord> queryStarInfo(String userId) {
        return create.selectFrom(STAR).where(STAR.USER_ID.eq(userId)).fetch();
    }

    public int queryStarCount(String userId) {
        Integer starCount = create.select(DSL.sum(STAR.STAR_)).from(STAR)
                            .where(STAR.USER_ID.eq(userId)).fetchOneInto(Integer.class);
        return starCount == null ? 0 : starCount;
    }

    public boolean saveStar(StarDto starDto) {
        StarRecord starRecord = create.selectFrom(STAR)
                                .where(STAR.USER_ID.eq(starDto.getUserId()))
                                .and(STAR.MAP_ID.eq(starDto.getMapId()))
                                .and(STAR.SUB_ID.eq(starDto.getSubId()))
                                .and(STAR.HARD_MODE.eq(starDto.isHardMode())).fetchOne();
        if (starRecord == null) {
            starRecord = create.newRecord(STAR);
            BeanUtils.copyProperties(starDto, starRecord);
            starRecord.insert();
            return true;
        } else {
            if (starRecord.getStar() >= starDto.getStar()) {
                return false;
            }

            BeanUtils.copyProperties(starDto, starRecord);
            starRecord.setUpdateTime(new Timestamp(System.currentTimeMillis()));
            starRecord.update();
            return true;
        }
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

    public RankBoardRecord queryFirstRank(String userId, String username) {
        if (StringUtils.isEmpty(userId)) {
            return create.selectFrom(RANK_BOARD)
                   .where(RANK_BOARD.USER_ID.isNull().and(RANK_BOARD.USERNAME.eq(username)))
                   .orderBy(RANK_BOARD.RANK)
                   .limit(1).fetchOne();
        } else {
            return create.selectFrom(RANK_BOARD)
                   .where(RANK_BOARD.USER_ID.eq(userId))
                   .orderBy(RANK_BOARD.RANK)
                   .limit(1).fetchOne();
        }
    }

    public void updateBoardRank(int start, Integer end) {
        if (end != null) {
            create.execute(String.format("update rank_board rb set rb.rank = rb.rank + 1 where rb.rank >= %d and rb.rank < %d;", start, end));
        } else {
            create.execute(String.format("update rank_board rb set rb.rank = rb.rank + 1 where rb.rank >= %d;", start));
        }
    }

    public void insertRank(RankDto rankDto) {
        RankBoardRecord record = create.newRecord(RANK_BOARD);
        BeanUtils.copyProperties(rankDto, record);
        record.insert();
    }
}

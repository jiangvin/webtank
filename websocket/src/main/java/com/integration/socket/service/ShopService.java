package com.integration.socket.service;

import com.integration.socket.model.dto.BuyDto;
import com.integration.socket.model.dto.UserDto;
import com.integration.socket.repository.dao.UserDao;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import com.integration.util.model.CustomException;
import com.integration.util.time.TimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/22
 */
@Slf4j
@Service
public class ShopService {
    @Autowired
    private UserDao userDao;

    /**
     * 以下数据需和前端同步
     */
    private static final int RED_STAR_PRICE = 12;
    private static final int CLOCK_PRICE = 10;
    private static final int GHOST_PRICE = 8;
    private static final int TANK02_PRICE = 20;
    private static final int TANK03_PRICE = 40;
    private static final int AGAIN_PRICE = 30;

    public UserDto buyWithCoin(BuyDto buyDto) {
        UserRecord userRecord = userDao.queryUser(buyDto.getUserId());
        if (userRecord == null) {
            throw new CustomException("用户不存在");
        }

        log.info("user:{} coin:{} try to buy:{}", userRecord.getUserId(), userRecord.getCoin(), buyDto.getBuyType());
        switch (buyDto.getBuyType()) {
            case RED_STAR:
                if (userRecord.getCoin() < RED_STAR_PRICE) {
                    throw new CustomException("金币不足!");
                }
                userRecord.setCoin(userRecord.getCoin() - RED_STAR_PRICE);
                userRecord.setRedStarExpired(TimeUtil.tomorrow());
                userRecord.update();
                return UserDto.convert(userRecord);
            case GHOST:
                if (userRecord.getCoin() < GHOST_PRICE) {
                    throw new CustomException("金币不足!");
                }
                userRecord.setCoin(userRecord.getCoin() - GHOST_PRICE);
                userRecord.setGhostExpired(TimeUtil.tomorrow());
                userRecord.update();
                return UserDto.convert(userRecord);
            case CLOCK:
                if (userRecord.getCoin() < CLOCK_PRICE) {
                    throw new CustomException("金币不足!");
                }
                userRecord.setCoin(userRecord.getCoin() - CLOCK_PRICE);
                userRecord.setClockExpired(TimeUtil.tomorrow());
                userRecord.update();
                return UserDto.convert(userRecord);
            case TANK02:
                if (userRecord.getCoin() < TANK02_PRICE) {
                    throw new CustomException("金币不足!");
                }
                userRecord.setCoin(userRecord.getCoin() - TANK02_PRICE);
                userRecord.setTankType("tank02");
                userRecord.setTankTypeExpired(TimeUtil.tomorrow());
                userRecord.update();
                return UserDto.convert(userRecord);
            case TANK03:
                if (userRecord.getCoin() < TANK03_PRICE) {
                    throw new CustomException("金币不足!");
                }
                userRecord.setCoin(userRecord.getCoin() - TANK03_PRICE);
                userRecord.setTankType("tank03");
                userRecord.setTankTypeExpired(TimeUtil.tomorrow());
                userRecord.update();
                return UserDto.convert(userRecord);
            case AGAIN_FOR_SINGLE:
                if (userRecord.getCoin() < AGAIN_PRICE) {
                    throw new CustomException("金币不足!");
                }
                userRecord.setCoin(userRecord.getCoin() - AGAIN_PRICE);
                userRecord.update();
                return UserDto.convert(userRecord);
            default:
                throw new CustomException("购买类型出错");
        }
    }
}

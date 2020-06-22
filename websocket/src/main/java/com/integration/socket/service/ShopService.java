package com.integration.socket.service;

import com.integration.socket.model.dto.BuyDto;
import com.integration.socket.model.dto.UserDto;
import com.integration.socket.repository.dao.UserDao;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import com.integration.util.model.CustomException;
import com.integration.util.time.TimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/22
 */

@Service
public class ShopService {
    @Autowired
    private UserDao userDao;

    /**
     * 以下数据需和前端同步
     */
    private static final int RED_STAR_PRICE = 12;

    public UserDto buyWithCoin(BuyDto buyDto) {
        UserRecord userRecord = userDao.queryUser(buyDto.getUserId());
        if (userRecord == null) {
            throw new CustomException("用户不存在");
        }

        switch (buyDto.getBuyType()) {
            case RED_STAR:
                if (userRecord.getCoin() < RED_STAR_PRICE) {
                    throw new CustomException("金币不足!");
                }
                userRecord.setCoin(userRecord.getCoin() - RED_STAR_PRICE);
                userRecord.setRedStarExpired(TimeUtil.tomorrow());
                userRecord.update();
                return UserDto.convert(userRecord);
            default:
                throw new CustomException("购买类型出错");
        }
    }
}

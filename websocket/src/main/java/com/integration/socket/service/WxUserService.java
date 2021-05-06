package com.integration.socket.service;

import com.integration.socket.model.dto.UserDto;
import com.integration.socket.model.dto.WxCodeDto;
import com.integration.socket.model.dto.WxUserDto;
import com.integration.socket.repository.dao.UserDao;
import com.integration.socket.repository.jooq.tables.records.UserRecord;
import com.integration.util.http.HttpUtil;
import com.integration.util.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2021/4/17
 */

@Service
public class WxUserService {
    @Value("${wx.url:https://api.weixin.qq.com/sns/jscode2session}")
    private String wxUrl;

    @Value("${wx.app.id:wxaf1365a4ed02dffc}")
    private String wxAppId;

    @Value("${wx.app.secret:696ed63bf9b701c4543ddaf5f15463c7}")
    private String wxAppSecret;

    @Autowired
    private UserDao userDao;

    public UserDto wxLogin(WxUserDto wxUserDto) {
        WxCodeDto dto = HttpUtil.postFormRequest(wxUrl, WxCodeDto.class, generateParams(wxUserDto.getCode()));
        if (dto.getOpenid() == null) {
            throw new CustomException("wx error:" + dto.getErrmsg());
        }
        String userId = "WX-" + dto.getOpenid();
        String userDevice = wxUserDto.getPlatform() + ";" + wxUserDto.getDevice();
        UserRecord userRecord = userDao.queryUser(userId);
        if (userRecord != null) {
            //更新资料
            userRecord.setUsername(wxUserDto.getUsername());
            userRecord.setUserDevice(userDevice);
            userDao.updateLoginTime(userRecord);
            UserDto userDto = UserDto.convert(userRecord);
            //查询星数
            userDto.setStar(userDao.queryStarCount(userId));
            //微信要额外加上userId
            userDto.setUserId(userId);
            return userDto;
        }

        //用户不存在
        UserDto userDto = new UserDto();
        userDto.setUserId(userId);
        userDto.setUsername(wxUserDto.getUsername());
        userDto.setUserDevice(userDevice);
        userDao.saveUser(userDto);
        return userDto;
    }

    private Map<String, String> generateParams(String code) {
        Map<String, String> params = new HashMap<>(8);
        params.put("appid", wxAppId);
        params.put("secret", wxAppSecret);
        params.put("grant_type", "authorization_code");
        params.put("js_code", code);
        return params;
    }
}

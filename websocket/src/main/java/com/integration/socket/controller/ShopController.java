package com.integration.socket.controller;

import com.integration.socket.model.dto.BuyDto;
import com.integration.socket.model.dto.EncryptDto;
import com.integration.socket.model.dto.UserDto;
import com.integration.socket.service.ShopService;
import com.integration.util.model.CustomException;
import com.integration.util.object.ObjectUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/22
 */

@RestController
@RequestMapping("shop")
public class ShopController {
    @Autowired
    private ShopService shopService;

    @PostMapping("/buyWithCoin")
    public UserDto buyWithCoin(@RequestBody EncryptDto encryptDto) {
        BuyDto buyDto = ObjectUtil.readValue(encryptDto.decrypt(), BuyDto.class);
        if (buyDto == null) {
            throw new CustomException("参数出错!");
        }
        if (StringUtils.isEmpty(buyDto.getUserId())) {
            throw new CustomException("网页用户不支持购买!");
        }

        return shopService.buyWithCoin(buyDto);
    }
}

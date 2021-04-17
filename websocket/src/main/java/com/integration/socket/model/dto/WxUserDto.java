package com.integration.socket.model.dto;

import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2021/4/17
 */

@Data
public class WxUserDto {
    private String code;
    private String device;
    private String platform;
    private String username;
}

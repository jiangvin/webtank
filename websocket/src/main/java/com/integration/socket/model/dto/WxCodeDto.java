package com.integration.socket.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2021/4/17
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WxCodeDto {
    private Integer errcode;
    private String errmsg;
    private String session_key;
    private String openid;
}

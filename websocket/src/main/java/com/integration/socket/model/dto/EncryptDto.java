package com.integration.socket.model.dto;

import com.integration.util.security.RsaPrivateSecurityUtil;
import lombok.Data;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/16
 */

@Data
public class EncryptDto {
    private static final RsaPrivateSecurityUtil SECURITY_UTIL = new RsaPrivateSecurityUtil("MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAIYsrZK84Dxbzhf/D0gOV3syI754QUIKIJ4rRzN4H7JLZ2xDsUB9F55ms3OckLMm8zCvZFaKv/T7GeC/Jk5w8Izc/VJJhkdRBfOsQZJdNxqooa9EcSdtaemwZpxxyJ2iZ+y8dgceh4KqSmuT+tZahGIBHscjquLAdA1vQUT8zC6TAgMBAAECgYAiXK7XNaf3zUsquhefzIx68IxW61VLJGzWFR9W/xye/NCv2WY7rc2us36hzScBuqftf/2ibEZc5zHpbQrSa/out+iIja8dzJ7tiegI/AVzsRMVa2h9C1jI/Ijkx6B1wPkfD/Lffx/3lwSTSo20fUSQI1lVPe9HgXCsC4jS94tIgQJBAOcnOZfqfDbkorfUk3hiKskUL120Tb2wwt+3RDPIqFznnff1W3rsTEeDqv/hHxgLD/ixZuQMQ756Z8F9ZcTp0k8CQQCUmNW7QNWpMEq4D/i7H9y9Chsij1Rhink4X8RYRsUsYc1JediDKCqQtvnxELNugebHH6O8voH0rBSIG7/5riJ9AkEApy0BRFO8Pl8hJ97AQSKOWxsUHqsWRoieh/odg24uBfMlln2HCeH4UQhzFdiVCmiFxpFXHruYCxywCYpNnhqVlQJAGu37xfzA+/FxiRvz4s2qbmP3ePLqwuaag1nvtmPU9e8fihJX56UO2b0fXM2/Bubp0Opt/RW1bYcGDYih6Pji7QJBAKcDC9gNcocQEmDeE+ryr+nfRwA2+xxp+BdyR+/Dw37GDDIBIGr1YZOH9diL+wrL3A5zSE3rbjplbMYJlTWoYug=");

    private String data;

    public String decrypt() {
        return SECURITY_UTIL.decrypt(data);
    }
}

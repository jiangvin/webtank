package com.integration.util.security;

import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.codec.binary.Base64;

import java.security.Key;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;

/**
 * @author 蒋文龙(Vin)
 * @description 基于RSA算法对资料加密解密的安全服务
 * @date 2019/12/18
 */
@Slf4j
public class RsaPublicSecurityUtil extends BaseSecurityUtil {
    @Override
    String getSecurityType() {
        return "RSA";
    }

    @Override
    Key generateKey(String keyStr) throws NoSuchAlgorithmException, InvalidKeySpecException {
        log.info("RSA Public Key: {}", keyStr);
        byte[] bytes = Base64.decodeBase64(keyStr);
        X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(bytes);
        KeyFactory keyFactory = KeyFactory.getInstance(getSecurityType());
        return keyFactory.generatePublic(publicKeySpec);
    }

    public RsaPublicSecurityUtil(String keyStr) {
        super(keyStr);
    }
}

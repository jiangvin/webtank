package com.integration.util.security;

import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.codec.binary.Base64;

import java.security.Key;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2019/12/18
 */
@Slf4j
public class RsaPrivateSecurityUtil extends BaseSecurityUtil {
    @Override
    String getSecurityType() {
        return "RSA";
    }

    @Override
    Key generateKey(String keyStr) throws NoSuchAlgorithmException, InvalidKeySpecException {
        log.info("RSA Private Key: {}", keyStr);
        byte[] bytes = Base64.decodeBase64(keyStr);
        PKCS8EncodedKeySpec privateKeySpec = new PKCS8EncodedKeySpec(bytes);
        KeyFactory keyFactory = KeyFactory.getInstance(getSecurityType());
        return keyFactory.generatePrivate(privateKeySpec);
    }

    public RsaPrivateSecurityUtil(String keyStr) {
        super(keyStr);
    }
}

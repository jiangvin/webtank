package com.integration.util.security;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.codec.binary.Base64;

import javax.crypto.Cipher;
import java.io.IOException;
import java.security.Key;

/**
 * @author 蒋文龙(Vin)
 * @description 加密解密算法的基类
 * @date 2019/12/18
 */
@Slf4j
public abstract class BaseSecurityUtil {
    /**
     * 加密器
     */
    Cipher encryptCipher = null;

    /**
     * 解密器
     */
    Cipher decryptCipher = null;

    private ObjectMapper objectMapper = new ObjectMapper();

    BaseSecurityUtil(String keyStr) {
        try {
            Key key = generateKey(keyStr);
            encryptCipher = Cipher.getInstance(getSecurityType());
            encryptCipher.init(Cipher.ENCRYPT_MODE, key);
            decryptCipher = Cipher.getInstance(getSecurityType());
            decryptCipher.init(Cipher.DECRYPT_MODE, key);
        } catch (Exception e) {
            log.error("SecurityUtil install error:", e);
        }
    }

    public String encrypt(Object object) {
        try {
            return encrypt(objectMapper.writeValueAsString(object));
        } catch (JsonProcessingException e) {
            log.error("Json parser error:", e);
        }
        return null;
    }

    /**
     * 加密逻辑: 1. 将要加密的字符串转换为字节数组(byte array)
     *          2. 将第一步的字节数组作为输入使用加密器(Cipher)的doFinal方法进行加密, 返回字节数组
     */
    public String encrypt(String strIn) {
        try {
            return Base64.encodeBase64String(encryptCipher.doFinal(strIn.getBytes()));
        } catch (Exception e) {
            log.error("encrypt error:", e);
        }
        return strIn;
    }

    public <T> T decrypt(String strIn, Class<T> valueType) {
        try {
            return objectMapper.readValue(decrypt(strIn), valueType);
        } catch (IOException e) {
            log.error("Json parser error:", e);
        }
        return null;
    }

    /**
     * 解密逻辑: 1. 把加密后的十六进制字符串转换成字节数组(byte array)
     *          2. 将第一步的字节数组作为输入使用加密器(Cipher)的doFinal方法进行解密, 返回字节数组(byte array)
     */
    public String decrypt(String strIn) {
        try {
            return new String(decryptCipher.doFinal(Base64.decodeBase64(strIn)));
        } catch (Exception e) {
            log.error("decrypt error:", e);
        }
        return strIn;
    }

    /**
     * 获取加密解密方法的名称
     * @return 如RSA,DES
     */
    abstract String getSecurityType();

    /**
     * 生成密钥
     * @param keyStr 密钥字串
     * @return 密钥结构体
     * @throws Exception 生成钥匙的异常
     */
    abstract Key generateKey(String keyStr) throws Exception;
}

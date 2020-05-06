package com.integration.util.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

import java.security.Key;
import java.util.UUID;

/**
 * @author 蒋文龙(Vin)
 * @description 基于DES算法对资料加密解密的安全服务
 * @date 2019/12/18
 */

@Slf4j
public class DesSecurityUtil extends BaseSecurityAdvancedUtil {

    @Override
    String getSecurityType() {
        return "DES";
    }

    @Override
    Key generateKey(String keyStr) {
        if (StringUtils.isEmpty(keyStr)) {
            keyStr = UUID.randomUUID().toString();
        }
        log.info("DES Key: {}", keyStr);
        byte[] keyArray = keyStr.getBytes();

        // 创建一个空的8位字节数组（默认值为0）
        byte[] byteArray = new byte[8];
        // 将原始字节数组转换为8位
        for (int i = 0; i < keyArray.length && i < byteArray.length; ++i) {
            byteArray[i] = keyArray[i];
        }
        // 生成密钥
        return new javax.crypto.spec.SecretKeySpec(byteArray, getSecurityType());
    }

    public DesSecurityUtil() {
        super(null);
    }

    public DesSecurityUtil(String keyStr) {
        super(keyStr);
    }
}

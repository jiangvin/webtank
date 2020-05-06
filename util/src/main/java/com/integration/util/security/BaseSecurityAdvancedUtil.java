package com.integration.util.security;

import lombok.extern.slf4j.Slf4j;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;

/**
 * @author 蒋文龙(Vin)
 * @description 加密解密算法的基类的加强版本，解决密文里面有特殊符号的问题
 * @date 2019/12/18
 */
@Slf4j
public abstract class BaseSecurityAdvancedUtil extends BaseSecurityUtil {
    BaseSecurityAdvancedUtil(String keyStr) {
        super(keyStr);
    }

    /**
     * 加密逻辑: 1. 将要加密的字符串转换为字节数组(byte array)
     *          2. 将第一步的字节数组作为输入使用加密器(Cipher)的doFinal方法进行加密, 返回字节数组
     *          3. 把加密后的字节数组转换成十六进制的字符串)
     */
    @Override
    public String encrypt(String strIn) {
        try {
            return byteArr2HexStr(encrypt(strIn.getBytes()));
        } catch (Exception e) {
            log.error("encrypt error:", e);
        }
        return strIn;
    }

    private byte[] encrypt(byte[] bytes) throws IllegalBlockSizeException, BadPaddingException {
        return encryptCipher.doFinal(bytes);
    }


    /**
     * 解密逻辑: 1. 把加密后的十六进制字符串转换成字节数组(byte array)
     *          2. 将第一步的字节数组作为输入使用加密器(Cipher)的doFinal方法进行解密, 返回字节数组(byte array)
     *          3. 把解密后的字节数组转换成字符串
     */
    @Override
    public String decrypt(String strIn) {
        try {
            return new String(decrypt(hexStr2ByteArr(strIn)));
        } catch (Exception e) {
            log.error("decrypt error:", e);
        }
        return strIn;
    }

    private byte[] decrypt(byte[] bytes) throws IllegalBlockSizeException, BadPaddingException {
        return decryptCipher.doFinal(bytes);
    }

    private static String byteArr2HexStr(byte[] bytes) {
        int iLen = bytes.length;
        // 每个byte用两个字符才能表示，所以字符串的长度是数组长度的两倍
        StringBuilder stringBuilder = new StringBuilder(iLen * 2);
        for (int aByte : bytes) {
            int intTmp = aByte;
            // 把负数转换为正数
            while (intTmp < 0) {
                intTmp = intTmp + 256;
            }
            // 小于0F的数需要在前面补0
            if (intTmp < 16) {
                stringBuilder.append("0");
            }
            stringBuilder.append(Integer.toString(intTmp, 16));
        }
        return stringBuilder.toString();
    }

    private static byte[] hexStr2ByteArr(String strIn) {
        byte[] bytes = strIn.getBytes();
        int iLen = bytes.length;
        // 两个字符表示一个字节，所以字节数组长度是字符串长度除以2
        byte[] arrOut = new byte[iLen / 2];
        for (int i = 0; i < iLen; i = i + 2) {
            String strTmp = new String(bytes, i, 2);
            arrOut[i / 2] = (byte) Integer.parseInt(strTmp, 16);
        }
        return arrOut;
    }
}

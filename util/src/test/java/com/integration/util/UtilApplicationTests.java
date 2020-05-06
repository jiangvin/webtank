package com.integration.util;

import com.integration.util.security.DesSecurityUtil;
import com.integration.util.security.RsaPrivateSecurityUtil;
import com.integration.util.security.RsaPublicSecurityUtil;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.codec.binary.Base64;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;

@RunWith(SpringRunner.class)
@SpringBootTest
public class UtilApplicationTests {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    private static class Person {
        private String name;
        private Integer age;
        private Boolean isHero;
    }

    @Test
    public void desSecurityServiceTest() {
        Person source = new Person("Vin", 18, false);
        String encodeTemplate = "c093955756da4ee6454dc5c9c5239450b6aa5154aba9d22a36d4737d6e074fae29b97838c726e644";

        //随机钥匙测试
        DesSecurityUtil desSecurityService = new DesSecurityUtil();
        String encode = desSecurityService.encrypt(source);
        Assert.assertNotEquals(source, encode);
        Assert.assertNotEquals(encode, encodeTemplate);
        Person decode = desSecurityService.decrypt(encode, Person.class);
        Assert.assertEquals(source, decode);

        //特定钥匙测试
        desSecurityService = new DesSecurityUtil("VIN");
        encode = desSecurityService.encrypt(source);
        Assert.assertEquals(encode, encodeTemplate);
        decode = desSecurityService.decrypt(encode, Person.class);
        Assert.assertEquals(source, decode);
    }

    @Test
    public void rsaSecurityServiceTest() throws NoSuchAlgorithmException {
        String source = "hello,world! 你好，世界！";
        //随机钥匙测试
        KeyPairGenerator keyPairGen = KeyPairGenerator.getInstance("RSA");
        keyPairGen.initialize(1024);
        KeyPair keyPair = keyPairGen.generateKeyPair();
        String publicKey = Base64.encodeBase64String(keyPair.getPublic().getEncoded());
        String privateKey = Base64.encodeBase64String(keyPair.getPrivate().getEncoded());

        RsaPublicSecurityUtil publicSecurityService = new RsaPublicSecurityUtil(publicKey);
        RsaPrivateSecurityUtil privateSecurityService = new RsaPrivateSecurityUtil(privateKey);
        //公钥加密，私钥解密
        String encode = publicSecurityService.encrypt(source);
        Assert.assertNotEquals(source, encode);
        String decode = privateSecurityService.decrypt(encode);
        Assert.assertEquals(source, decode);

        //私钥加密，公钥解密
        encode = privateSecurityService.encrypt(source);
        Assert.assertNotEquals(source, encode);
        decode = publicSecurityService.decrypt(encode);
        Assert.assertEquals(source, decode);

        //特定钥匙测试 特定钥匙生成测试网(PKCS#8格式): http://web.chacuo.net/netrsakeypair
        publicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCGLK2SvOA8W84X/w9IDld7MiO+eEFCCiCeK0czeB+yS2dsQ7FAfReeZrNznJCzJvMwr2RWir/0+xngvyZOcPCM3P1SSYZHUQXzrEGSXTcaqKGvRHEnbWnpsGacccidomfsvHYHHoeCqkprk/rWWoRiAR7HI6riwHQNb0FE/MwukwIDAQAB";
        privateKey = "MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAIYsrZK84Dxbzhf/D0gOV3syI754QUIKIJ4rRzN4H7JLZ2xDsUB9F55ms3OckLMm8zCvZFaKv/T7GeC/Jk5w8Izc/VJJhkdRBfOsQZJdNxqooa9EcSdtaemwZpxxyJ2iZ+y8dgceh4KqSmuT+tZahGIBHscjquLAdA1vQUT8zC6TAgMBAAECgYAiXK7XNaf3zUsquhefzIx68IxW61VLJGzWFR9W/xye/NCv2WY7rc2us36hzScBuqftf/2ibEZc5zHpbQrSa/out+iIja8dzJ7tiegI/AVzsRMVa2h9C1jI/Ijkx6B1wPkfD/Lffx/3lwSTSo20fUSQI1lVPe9HgXCsC4jS94tIgQJBAOcnOZfqfDbkorfUk3hiKskUL120Tb2wwt+3RDPIqFznnff1W3rsTEeDqv/hHxgLD/ixZuQMQ756Z8F9ZcTp0k8CQQCUmNW7QNWpMEq4D/i7H9y9Chsij1Rhink4X8RYRsUsYc1JediDKCqQtvnxELNugebHH6O8voH0rBSIG7/5riJ9AkEApy0BRFO8Pl8hJ97AQSKOWxsUHqsWRoieh/odg24uBfMlln2HCeH4UQhzFdiVCmiFxpFXHruYCxywCYpNnhqVlQJAGu37xfzA+/FxiRvz4s2qbmP3ePLqwuaag1nvtmPU9e8fihJX56UO2b0fXM2/Bubp0Opt/RW1bYcGDYih6Pji7QJBAKcDC9gNcocQEmDeE+ryr+nfRwA2+xxp+BdyR+/Dw37GDDIBIGr1YZOH9diL+wrL3A5zSE3rbjplbMYJlTWoYug=";
        publicSecurityService = new RsaPublicSecurityUtil(publicKey);
        privateSecurityService = new RsaPrivateSecurityUtil(privateKey);

        decode = publicSecurityService.decrypt(privateSecurityService.encrypt(source));
        Assert.assertEquals(source, decode);
        decode = privateSecurityService.decrypt(publicSecurityService.encrypt(source));
        Assert.assertEquals(source, decode);

        //公钥加密，私钥解密
        String encode1 = publicSecurityService.encrypt(source);
        String encode2 = publicSecurityService.encrypt(source);
        //公钥加密结果每次都不一样
        Assert.assertNotEquals(encode1, encode2);
        decode = privateSecurityService.decrypt(encode1);
        Assert.assertEquals(decode, source);
        decode = privateSecurityService.decrypt(encode2);
        Assert.assertEquals(decode, source);

        //私钥加密，公钥解密
        encode1 = privateSecurityService.encrypt(source);
        encode2 = privateSecurityService.encrypt(source);
        //私钥加密结果每次都一样
        Assert.assertEquals(encode1, encode2);
        decode = publicSecurityService.decrypt(encode1);
        Assert.assertEquals(decode, source);
    }
}

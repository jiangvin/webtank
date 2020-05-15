package com.integration.bot;

import java.io.ByteArrayOutputStream;
import java.io.ObjectOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import com.fasterxml.jackson.databind.ObjectMapper;
import jdk.nashorn.internal.objects.NativeUint8Array;
import lombok.Cleanup;
import org.springframework.messaging.converter.ByteArrayMessageConverter;
import org.springframework.messaging.converter.GenericMessageConverter;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.converter.SimpleMessageConverter;
import org.springframework.messaging.converter.StringMessageConverter;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.Transport;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

//@SpringBootApplication
public class BotApplication {

    public static void main(String[] args) throws InterruptedException, ExecutionException, TimeoutException {
        final CountDownLatch latch = new CountDownLatch(1);
        List<Transport> transports = new ArrayList<>(1);
        transports.add(new WebSocketTransport(new StandardWebSocketClient()));
        WebSocketClient transport = new SockJsClient(transports);
        WebSocketStompClient stompClient = new WebSocketStompClient(transport);
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());
        ThreadPoolTaskScheduler taskScheduler = new ThreadPoolTaskScheduler();
        taskScheduler.afterPropertiesSet();
        //for heartbeats
        stompClient.setTaskScheduler(taskScheduler);
        StompSessionHandler customHandler = new MyStompSessionHandler();
        StompSession session = stompClient.connect("http://localhost/websocket-simple?name=bot", customHandler).get(1, TimeUnit.SECONDS);
        try {
            MessageDto messageDto = new MessageDto(null, "CLIENT_READY", null);
            session.subscribe("/topic/send", customHandler);
            session.subscribe("/user/queue/send", customHandler);
            ObjectMapper objectMapper = new ObjectMapper();
//            @Cleanup ByteArrayOutputStream bos = new ByteArrayOutputStream();
//            ObjectOutputStream out = null;
//            out = new ObjectOutputStream(bos);
//            out.writeObject(messageDto);
//            out.flush();
//            byte[] yourBytes = bos.toByteArray();
//            StompHeaders stompHeaders = new StompHeaders();
//            stompHeaders.setDestination( "/send");
//            stompHeaders.setContentType( MimeTypeUtils.APPLICATION_OCTET_STREAM );
            session.send("/send", messageDto);
            latch.await(31536000, TimeUnit.SECONDS);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

package com.ts.configs;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
            .addEndpoint("/ws")
            .setAllowedOriginPatterns(
                "http://localhost:3000",
                "http://localhost:5173"
            );
//            .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {

        // server → client
        registry.enableSimpleBroker(
            "/topic",
            "/queue"
        );

        // client → server
        registry.setApplicationDestinationPrefixes("/app");

        // enables /user/queue/notifications
        registry.setUserDestinationPrefix("/user");
    }
}

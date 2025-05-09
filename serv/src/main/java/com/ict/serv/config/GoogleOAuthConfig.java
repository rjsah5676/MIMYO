package com.ict.serv.config;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.UserCredentials;

@Component
@Getter
@Slf4j
public class GoogleOAuthConfig {

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.client-secret}")
    private String clientSecret;

    @Value("${google.refresh-token}")
    private String refreshToken;

    @Value("${google.email}")
    private String email;

    public String getAccessToken() {
        try {
            GoogleCredentials credentials = UserCredentials.newBuilder()
                    .setClientId(clientId)
                    .setClientSecret(clientSecret)
                    .setRefreshToken(refreshToken)
                    .build();

            credentials.refreshIfExpired();
            AccessToken token = credentials.getAccessToken();
            return token.getTokenValue();
        } catch (IOException e) {
            log.error("액세스 토큰 가져오기 실패", e);
            return null;
        }
    }
}

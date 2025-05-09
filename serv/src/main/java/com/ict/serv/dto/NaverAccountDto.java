package com.ict.serv.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.Properties;

@Data
public class NaverAccountDto {
    private String resultcode;
    private String message;
    private Response response;

    @Data
    public static class Response {
        private String id;
        private String nickname;
        private String profile_image;
        private String email;
    }
}
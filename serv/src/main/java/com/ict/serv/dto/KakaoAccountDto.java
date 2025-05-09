package com.ict.serv.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.Properties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class KakaoAccountDto {

    public Long id;
    public String connected_at;
    public Properties properties;
    public KakaoAccount kakao_account;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KakaoAccount {
        public Boolean profile_nickname_needs_agreement;
        public Boolean email_needs_agreement;
        public Boolean is_email_valid;
        public Boolean is_email_verified;
        public Boolean has_email;

        public String email;
        public KakaoProfile profile;

        // 추가된 필드들
        public Boolean profile_image_needs_agreement;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KakaoProfile {
        public String nickname;
        public String profile_image_url;
        public String thumbnail_image_url;
        public Boolean is_default_image;
        public Boolean is_default_nickname;
    }
}
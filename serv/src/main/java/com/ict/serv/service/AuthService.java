package com.ict.serv.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ict.serv.dto.*;
import com.ict.serv.entity.Authority;
import com.ict.serv.entity.user.Account;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;

    @Value("${kakao.client-id}")
    String KAKAO_CLIENT_ID;

    @Value("${kakao.redirect-uri}")
    String KAKAO_REDIRECT_URI;

    @Value("${google.client-id}")
    String GOOGLE_CLIENT_ID;

    @Value("${google.client-secret}")
    String GOOGLE_CLIENT_SECRET;
    private final MailService mailService;

    @Value("${naver.redirect-uri}")
    String NAVER_REDIRECT_URI;

    @Value("${naver.client-id}")
    String NAVER_CLIENT_ID;

    @Value("${naver.client-secret}")
    String NAVER_CLIENT_SECRET;

    private final Map<String, String> verificationCodes = new HashMap<>();


    public User findByUserid(String userid) {
        return (User) userRepository.findByUserid(userid)
                .orElse(null);
    }
    public String sendVerificationCode(String email) {
        String code = mailService.generateVerificationCode();
        mailService.sendVerificationCode(email, code);
        verificationCodes.put(email, code);  // 인증번호 저장
        System.out.println("발송 및 저장된 인증번호: " + code);  // 디버깅용
        return code;
    }

    public boolean verifyCode(String email, String code) {
        String savedCode = verificationCodes.get(email);
        if (savedCode == null) {
            System.out.println("저장된 인증번호 없음");
            return false;
        }
        System.out.println("입력 코드: " + code + ", 저장 코드: " + savedCode);
        return savedCode.equals(code);
    }

    public Map<String, Object> getGoogleUserInfo(String accessToken) {
        String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken); // Authorization: Bearer {access_token} 설정

        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(userInfoUrl, HttpMethod.GET, request, Map.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            return response.getBody();
        } else {
            throw new RuntimeException("Failed to get Google user info");
        }
    }

    public String getGoogleAccessToken(String code) {
        String tokenUrl = "https://oauth2.googleapis.com/token";

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> body = new HashMap<>();
        body.put("code", code);
        body.put("client_id", GOOGLE_CLIENT_ID);
        body.put("client_secret", GOOGLE_CLIENT_SECRET);
        body.put("redirect_uri", "http://localhost:3000/login/oauth2/code/google");
        body.put("grant_type", "authorization_code");

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            return response.getBody().get("access_token").toString();
        } else {
            throw new RuntimeException("Failed to get Google access token");
        }
    }

    public NaverTokenDto getNaverAccessToken(String code) {
        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", NAVER_CLIENT_ID);
        params.add("client_secret", NAVER_CLIENT_SECRET);
        params.add("redirect_uri", NAVER_REDIRECT_URI);
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> naverTokenRequest = new HttpEntity<>(params, headers);

        ResponseEntity<String> accessTokenResponse = rt.exchange(
                "https://nid.naver.com/oauth2.0/token",
                HttpMethod.POST,
                naverTokenRequest,
                String.class
        );

        System.out.println("네이버 응답 본문: " + accessTokenResponse.getBody());

        ObjectMapper objectMapper = new ObjectMapper();
        NaverTokenDto naverTokenDto = null;
        try {
            naverTokenDto = objectMapper.readValue(accessTokenResponse.getBody(), NaverTokenDto.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return naverTokenDto;
    }


    public KakaoTokenDto getKakaoAccessToken(String code) {

        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", KAKAO_CLIENT_ID);
        params.add("redirect_uri", KAKAO_REDIRECT_URI);
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> kakaoTokenRequest = new HttpEntity<>(params, headers);
        System.out.println(kakaoTokenRequest);

        ResponseEntity<String> accessTokenResponse = rt.exchange(
                "https://kauth.kakao.com/oauth/token",
                HttpMethod.POST,
                kakaoTokenRequest,
                String.class
        );

        ObjectMapper objectMapper = new ObjectMapper();
        KakaoTokenDto kakaoTokenDto = null;
        try {
            kakaoTokenDto = objectMapper.readValue(accessTokenResponse.getBody(), KakaoTokenDto.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return kakaoTokenDto;
    }

    public KakaoAccountDto getKakaoInfo(String kakaoAccessToken) {

        RestTemplate rt = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + kakaoAccessToken);
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        HttpEntity<MultiValueMap<String, String>> accountInfoRequest = new HttpEntity<>(headers);

        ResponseEntity<String> accountInfoResponse = rt.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.POST,
                accountInfoRequest,
                String.class
        );

        // 응답 상태 코드 로그 출력
        System.out.println("카카오 응답 상태 코드: " + accountInfoResponse.getStatusCode());
        System.out.println("카카오 응답 본문: " + accountInfoResponse.getBody());

        ObjectMapper objectMapper = new ObjectMapper();
        KakaoAccountDto kakaoAccountDto = null;
        try {
            kakaoAccountDto = objectMapper.readValue(accountInfoResponse.getBody(), KakaoAccountDto.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        // kakaoAccountDto가 제대로 파싱되었는지 확인
        if (kakaoAccountDto == null) {
            System.out.println("카카오 계정 정보 파싱 실패");
        } else {
            System.out.println("카카오 계정 정보 파싱 성공");
        }

        return kakaoAccountDto;
    }

    public NaverAccountDto getNaverInfo(String naverAccessToken) {
        RestTemplate rt = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + naverAccessToken);
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        HttpEntity<MultiValueMap<String, String>> accountInfoRequest = new HttpEntity<>(headers);

        ResponseEntity<String> accountInfoResponse = rt.exchange(
                "https://openapi.naver.com/v1/nid/me",
                HttpMethod.POST,
                accountInfoRequest,
                String.class
        );

        // 응답 상태 코드 로그 출력
        System.out.println("네이버 응답 상태 코드: " + accountInfoResponse.getStatusCode());
        System.out.println("네이버 응답 본문: " + accountInfoResponse.getBody());

        ObjectMapper objectMapper = new ObjectMapper();
        NaverAccountDto naverAccountDto = null;
        try {
            naverAccountDto = objectMapper.readValue(accountInfoResponse.getBody(), NaverAccountDto.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        // kakaoAccountDto가 제대로 파싱되었는지 확인
        if (naverAccountDto == null) {
            System.out.println("카카오 계정 정보 파싱 실패");
        } else {
            System.out.println(naverAccountDto+"!!!!!!!!!!");
            System.out.println("카카오 계정 정보 파싱 성공");
        }

        return naverAccountDto;
    }

    public Account mapKakaoInfo(KakaoAccountDto accountDto) {
        Long kakaoId = accountDto.getId();
        String email = accountDto.getKakao_account().getEmail();
        String nickname = accountDto.getKakao_account().getProfile().getNickname();
        String picture = accountDto.getKakao_account().getProfile().getProfile_image_url();
        System.out.println("매핑한 정보 : " + email + ", " + nickname);
        return Account.builder()
                .id(kakaoId)
                .email(email)
                .nickname(nickname)
                .loginType("USER")
                .picture(picture)
                .build();
    }

    public Account mapNaverInfo(NaverAccountDto accountDto) {
        String email = accountDto.getResponse().getEmail();
        String nickname = accountDto.getResponse().getNickname();
        String picture = accountDto.getResponse().getProfile_image();

        System.out.println("매핑한 정보 : " + email + ", " + nickname);

        return Account.builder()
                .email(email)
                .nickname(nickname)
                .loginType("USER")
                .picture(picture)
                .build();
    }

    public Account kakaoSignup(String kakaoAccessToken) {
        KakaoAccountDto kakaoAccountDto = getKakaoInfo(kakaoAccessToken);

        if (kakaoAccountDto.getKakao_account() == null) {
            System.out.println("카카오 계정 정보가 없습니다.");
            throw new IllegalArgumentException("카카오 계정 정보가 없습니다.");
        }

        String kakaoEmail = kakaoAccountDto.getKakao_account().getEmail();

        if (kakaoEmail == null || kakaoEmail.isEmpty()) {
            System.out.println("카카오 이메일이 존재하지 않습니다.");
            throw new IllegalArgumentException("카카오 이메일이 존재하지 않습니다.");
        }
        Account selectedAccount = mapKakaoInfo(kakaoAccountDto);
        System.out.println("수신된 account 정보 : " + selectedAccount);
        SignupResponseDto loginResponseDto = new SignupResponseDto();
        loginResponseDto.setKakaoAccessToken(kakaoAccessToken);

        return selectedAccount;
    }

    public Account naverSignup(String naverAccessToken) {
        NaverAccountDto naverAccountDto = getNaverInfo(naverAccessToken);
        if (naverAccountDto.getResponse() == null) {
            System.out.println("네이버 계정 정보가 없습니다.");
            throw new IllegalArgumentException("네이버 계정 정보가 없습니다.");
        }

        String naverEmail = naverAccountDto.getResponse().getEmail();

        if (naverEmail == null || naverEmail.isEmpty()) {
            System.out.println("네이버 이메일이 존재하지 않습니다.");
            throw new IllegalArgumentException("네이버 이메일이 존재하지 않습니다.");
        }
        Account selectedAccount = mapNaverInfo(naverAccountDto);
        System.out.println("수신된 account 정보 : " + selectedAccount);
        SignupResponseDto loginResponseDto = new SignupResponseDto();
        loginResponseDto.setKakaoAccessToken(naverAccessToken);

        return selectedAccount;
    }

    public User isAlreadySignUp(Account account) {
        User user = userRepository.findByEmail(account.getEmail());
        if(user == null) {
            User new_user = new User();
            new_user.setEmail(account.getEmail());
            new_user.setAuthority(Authority.ROLE_USER);
            new_user.setGrade(0);
            new_user.setGradePoint(0);
            new_user.setKakaoProfileUrl(account.getPicture());
            new_user.setUsername(account.getNickname());
            new_user.setUserid(account.getEmail());
            user = userRepository.save(new_user);
        }
        return user;
    }

    public User findUserByEmail(String email){
        return userRepository.findByEmail(email);
    }
    public void saveUser(User user) {
        userRepository.save(user);
    }

    public int idDuplicateCheck(String userid) {
        return userRepository.countByUserid(userid);
    }

    public int telCheck(String tel) {
        return userRepository.countByTel(tel);
    }
}

package com.ict.serv.controller;

import com.ict.serv.dto.*;
import com.ict.serv.entity.user.Account;
import com.ict.serv.entity.Authority;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.AuthService;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.LogService;
import com.ict.serv.util.JwtProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;



import java.io.File;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final InteractService interactService;
    private final LogService logService;

    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @GetMapping("/auth/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        // 유저 정보 반환 (비밀번호 제외)
        return ResponseEntity.ok(new UserResponseDto(user.getId(),user.getUserid(), user.getUsername(),
                user.getEmail(), user.getUploadedProfileUrl(), user.getInfoText(), user.getAuthority(),user.getZipcode(),user.getAddress(),user.getAddressDetail(),user.getGrade(),user.getGradePoint()));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto loginRequest, HttpServletRequest request) {
        User user = authService.findByUserid(loginRequest.getUserid());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유저가 존재하지 않습니다.");
        }

        if (!passwordEncoder.matches(loginRequest.getUserpw(), user.getUserpw())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호가 일치하지 않습니다.");
        }
        if(user.getAuthority() == Authority.ROLE_BANNED) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("정지된 사용자입니다.");
        }
        String token = jwtProvider.createToken(user.getUserid());
        logService.userJoinSave(user);
        HttpSession session = request.getSession();
        session.setAttribute("JWT", token);

        UserResponseDto userResponse = new UserResponseDto(
                user.getId(),
                user.getUserid(),
                user.getUsername(),
                user.getEmail(),
                user.getProfileImageUrl(),
                user.getInfoText(),
                user.getAuthority(),
                user.getZipcode(),
                user.getAddress(),
                user.getAddressDetail(),
                user.getGrade(),
                user.getGradePoint()
        );
        return ResponseEntity.ok(new LoginResponseDto(token, "로그인 성공", userResponse));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        Cookie cookie = new Cookie("JSESSIONID", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);

        SecurityContextHolder.clearContext();

        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");

        return ResponseEntity.ok("로그아웃 성공");
    }

    @GetMapping("/signup/kakao")
    public User kakaoSignup(HttpServletRequest request) {
        String code = request.getParameter("code");
        KakaoTokenDto kakaoTokenDto = authService.getKakaoAccessToken(code);
        String kakaoAccessToken = kakaoTokenDto.getAccess_token();

        Account account = authService.kakaoSignup(kakaoAccessToken);
        return authService.isAlreadySignUp(account);
    }

    @GetMapping("/signup/naver")
    public User naverSignup(HttpServletRequest request) {
        String code = request.getParameter("code");
        NaverTokenDto token = authService.getNaverAccessToken(code);
        String accessToken = token.getAccess_token();

        Account account = authService.naverSignup(accessToken);
        return authService.isAlreadySignUp(account);
    }

    @GetMapping("/signup/google")
    public User googleSignup(HttpServletRequest request) {
        String code = request.getParameter("code");
        String accessToken = authService.getGoogleAccessToken(code);
        Map<String, Object> googleUserInfo = authService.getGoogleUserInfo(accessToken);

        String googleId = googleUserInfo.get("id").toString();
        String email = googleUserInfo.get("email").toString();
        String name = googleUserInfo.get("name").toString();
        String profileImage = googleUserInfo.get("picture").toString();
        Account account = new Account();
        account.setNickname(name);
        account.setPicture(profileImage);
        account.setEmail(email);
        System.out.println(account);
        return authService.isAlreadySignUp(account);
    }

    @PostMapping("/auth/socialLogin")
    public ResponseEntity<?> login(@RequestBody User user, HttpServletRequest request) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유저가 존재하지 않습니다.");
        }
        if(user.getAuthority() == Authority.ROLE_BANNED) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("정지된 사용자입니다.");
        }
        String token = jwtProvider.createToken(user.getUserid());
        logService.userJoinSave(user);
        HttpSession session = request.getSession();
        session.setAttribute("JWT", token);

        UserResponseDto userResponse = new UserResponseDto(
                user.getId(),
                user.getUserid(),
                user.getUsername(),
                user.getEmail(),
                user.getProfileImageUrl(),
                user.getInfoText(),
                user.getAuthority(),
                user.getZipcode(),
                user.getAddress(),
                user.getAddressDetail(),
                user.getGrade(),
                user.getGradePoint()
        );
        return ResponseEntity.ok(new LoginResponseDto(token, "로그인 성공", userResponse));
    }

    @GetMapping("/signup/duplicateCheck")
    public int duplicateCheck(String userid) {
        return authService.idDuplicateCheck(userid);
    }

    @GetMapping("/signup/telCheck")
    public int telCheck(String tel) {
        return authService.telCheck(tel);
    }

    @PostMapping("/signup/doSignUp")
    public ResponseEntity<String> doSignUp(@RequestParam("userid") String userid, @RequestParam("username") String username,
                                           @RequestParam("email") String email, @RequestParam("userpw") String userpw,
                                           @RequestParam("tel") String tel, @RequestParam("address") String address,
                                           @RequestParam("addressDetail") String addressDetail, @RequestParam("zipcode") String zipcode,
                                           @RequestParam(value = "profileImage", required = false) MultipartFile profileImage,
                                           @RequestParam(value = "kakaoProfileUrl", required = false) String kakaoProfileUrl,
                                           @RequestParam("infoText") String infoText)
    {
        System.out.println(username);
        try {
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            String encryptedPassword = passwordEncoder.encode(userpw);

            String uploadDir = System.getProperty("user.dir") + "/uploads/user/profile";    //path는 무조건 이 경로
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String uploadedProfileUrl = null;

            if (profileImage != null && !profileImage.isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + profileImage.getOriginalFilename();
                File dest = new File(uploadDir, fileName);
                profileImage.transferTo(dest);
                uploadedProfileUrl = "/uploads/user/profile/" + fileName;
            }

            String finalProfileUrl = (uploadedProfileUrl != null) ? uploadedProfileUrl : kakaoProfileUrl;

            User newUser = User.builder()
                    .userid(userid)
                    .username(username)
                    .email(email)
                    .userpw(encryptedPassword)
                    .tel(tel)
                    .address(address)
                    .addressDetail(addressDetail)
                    .zipcode(zipcode)
                    .kakaoProfileUrl(kakaoProfileUrl)
                    .uploadedProfileUrl(finalProfileUrl)
                    .infoText(infoText)
                    .authority(Authority.ROLE_USER)
                    .build();

            authService.saveUser(newUser);

            return ResponseEntity.ok("회원가입 성공");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 실패: " + e.getMessage());
        }
    }

    /*
    @PostMapping("/signup")
    public ResponseEntity<SignupResponseDto> kakaoSignup(@RequestBody SignupRequestDto requestDto) {

        // requestDto 로 데이터 받아와서 accountId 반환
        Long accountId = authService.kakaoSignUp(requestDto);
        System.out.println(accountId);
        // 최초 가입자에게는 RefreshToken, AccessToken 모두 발급

   //     TokenDto tokenDto = securityService.signup(accountId);

        // AccessToken 은 header 에 세팅하고, refreshToken 은 httpOnly 쿠키로 세팅
        SignupResponseDto signUpResponseDto = new SignupResponseDto();
        HttpHeaders headers = new HttpHeaders();
     ResponseCookie cookie = ResponseCookie.from("RefreshToken", tokenDto.getRefreshToken())
                .maxAge(60*60*24*7) // 쿠키 유효기간 7일로 설정했음
                .path("/")
                .secure(true)
                .sameSite("None")
                .httpOnly(true)
                .build();
     //   headers.add("Set-Cookie", cookie.toString());
     //   headers.add("Authorization", tokenDto.getAccessToken());

        signUpResponseDto.setResult("가입이 완료되었습니다.");
        return ResponseEntity.ok().headers(headers).body(signUpResponseDto);
    }*/

    @PostMapping("/auth/signup-send-code")
    public ResponseEntity<?> signupSendVerificationCode(@RequestBody EmailRequestDto request) {
        User user = authService.findUserByEmail(request.getEmail());

        System.out.println(user);
        if(user == null) {
            try {
                authService.sendVerificationCode(request.getEmail());
                return ResponseEntity.ok("인증번호가 전송되었습니다.");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("이메일 전송 실패: " + Optional.ofNullable(e.getMessage()).orElse("알 수 없는 오류"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "이미 가입한 메일 주소입니다."));
    }
    @PostMapping("/auth/email-verify")
    public ResponseEntity<Map<String, String>> verifyCodeForEmail(@RequestParam String email, @RequestParam String code) {
        if (!authService.verifyCode(email, code)) {
            return ResponseEntity.badRequest().body(Map.of("message", "인증번호가 올바르지 않습니다."));
        }
        return ResponseEntity.ok(Map.of(
                "message", "이메일 인증이 완료되었습니다."
        ));
    }

    @PostMapping("/auth/send-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody EmailRequestDto request) {
        User user = authService.findUserByEmail(request.getEmail());
        if(user == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("해당 이메일의 사용자가 없습니다.");
        }
        try {
            authService.sendVerificationCode(request.getEmail());
            return ResponseEntity.ok("인증번호가 전송되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("이메일 전송 실패: " + Optional.ofNullable(e.getMessage()).orElse("알 수 없는 오류"));
        }
    }

    @PostMapping("/auth/find-id/verify")
    public ResponseEntity<Map<String, String>> verifyCodeAndFindId(@RequestParam String email, @RequestParam String code) {
        if (!authService.verifyCode(email, code)) {
            return ResponseEntity.badRequest().body(Map.of("message", "인증번호가 올바르지 않습니다."));
        }

        User user = authService.findUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "해당 이메일로 가입된 계정을 찾을 수 없습니다."));
        }

        return ResponseEntity.ok(Map.of(
                "message", "아이디를 찾았습니다.",
                "userid", user.getUserid()
        ));
    }

    @PostMapping("/auth/reset-password/request")
    public ResponseEntity<Map<String, String>> requestPasswordReset(@RequestParam String userid, @RequestParam String email) {
        User user = authService.findByUserid(userid);

        if (user == null || !user.getEmail().equals(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "아이디와 이메일이 일치하지 않습니다."));
        }

        String verificationCode = authService.sendVerificationCode(email);
        return ResponseEntity.ok(Map.of("message", "비밀번호 재설정 인증번호가 이메일로 전송되었습니다."));
    }

    @PostMapping("/auth/reset-password/verify")
    public ResponseEntity<Map<String, String>> verifyResetCode(@RequestParam String email, @RequestParam String code) {
        if (!authService.verifyCode(email, code)) {
            return ResponseEntity.badRequest().body(Map.of("message", "인증번호가 올바르지 않습니다."));
        }
        return ResponseEntity.ok(Map.of("message", "인증 성공"));
    }

    @PostMapping("/auth/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String email, @RequestParam String newPassword) {
        User user = authService.findUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 이메일의 사용자를 찾을 수 없습니다.");
        }
        user.setUserpw(passwordEncoder.encode(newPassword));
        authService.saveUser(user);
        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }


}
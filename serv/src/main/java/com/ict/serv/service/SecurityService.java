package com.ict.serv.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecurityService {
    /*
    private final JwtProvider jwtProvider;

    public TokenDto login(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(CEmailLoginFailedException::new);
        System.out.println("SecurityService-login: 계정을 찾았습니다. " + account);
        // 토큰 발행
        TokenDto tokenDto = jwtProvider.generateTokenDto(email);
        // RefreshToken 만 DB에 저장
        // signup 시에도 저장하고, 로그인시에도 저장하므로 존재하는 토큰을 찾기 위해 key 값이 필요
        RefreshToken refreshToken = RefreshToken.builder()
                .key(account.getId())
                .token(tokenDto.getRefreshToken())
                .build();
        tokenRepository.save(refreshToken);
        System.out.println("토큰 발급과 저장을 완료했습니다.");
        return tokenDto;
    }

    public TokenDto signup(SignupRequestDto requestDto) {
        Account account = requestDto.getAccount();
        return jwtProvider.generateTokenDto(account.getEmail());
    }
    */
}

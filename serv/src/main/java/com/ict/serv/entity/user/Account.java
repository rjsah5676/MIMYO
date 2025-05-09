package com.ict.serv.entity.user;

import com.ict.serv.entity.Authority;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Account{

    private Long id;

    private String loginType;

    @Enumerated(EnumType.STRING)
    private Authority authority;

    private String kakaoName; //카카오닉네임

    private String nickname; //사용자별명

    private String email;

    private String picture;

    private String accountName;
}
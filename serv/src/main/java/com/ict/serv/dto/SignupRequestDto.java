package com.ict.serv.dto;

import com.ict.serv.entity.user.Account;
import lombok.Data;

@Data
public class SignupRequestDto {

    public String nickname;
    public String picture;
    public Account account;
    public String kakaoAccessToken;
    public String accountName;
}

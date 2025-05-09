package com.ict.serv.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPwdModDto {
    private Long userId;
    private String currentUserPw;
    private String modUserPw;
}

package com.ict.serv.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponseDto {
    private String token;
    private String message;
    private UserResponseDto user;
}
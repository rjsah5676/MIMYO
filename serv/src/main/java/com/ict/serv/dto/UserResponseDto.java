package com.ict.serv.dto;

import com.ict.serv.entity.Authority;
import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class UserResponseDto {
    private Long id;
    private String userid;
    private String username;
    private String email;
    private String imgUrl;
    private String infoText;
    private Authority authority;
    private String zipcode;
    private String address;
    private String addressDetail;
    private int grade;
    private int gradePoint;
}
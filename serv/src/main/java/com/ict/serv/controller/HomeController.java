package com.ict.serv.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HomeController {
    @GetMapping("/")
    public String home(){
        return "index";
    }
    @GetMapping("/test")
    public String test(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return "로그인이 필요합니다.";
        }

        System.out.println(userDetails);
        return "현재 로그인된 유저: " + userDetails.getUsername();
    }
    @GetMapping("/checkLogin")
    public String checkLogin(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
        System.out.println(userDetails.getUsername()+"!!!???");
        return "ok";
    }
}

package com.ict.serv.entity.coupon;

import lombok.Data;

@Data
public class CouponRequestDTO {
    private Long userId;
    private String couponName;
    private int discount;
}

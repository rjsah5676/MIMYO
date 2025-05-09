package com.ict.serv.dto;

import lombok.Data;

@Data
public class OrderRequestDto {
    private Long optionCategoryId;
    private int quantity;
    private int coupon;
    private int shippingFee;
}

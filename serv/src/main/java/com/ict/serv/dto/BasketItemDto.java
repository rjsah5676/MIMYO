package com.ict.serv.dto;

import lombok.Data;

@Data
public class BasketItemDto {
    private Long optionId;
    private Long subOptionId;
    private int quantity;
}

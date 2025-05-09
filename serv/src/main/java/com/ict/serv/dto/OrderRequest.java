package com.ict.serv.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    private List<OrderRequestDto> options;
    private String addrId;
    private String req;
    private String orderId;
    private int shippingFee;
    private int couponDiscount;
}

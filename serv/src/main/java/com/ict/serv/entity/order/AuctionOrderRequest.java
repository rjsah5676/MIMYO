package com.ict.serv.entity.order;

import com.ict.serv.dto.OrderRequestDto;
import lombok.Data;

import java.util.List;

@Data
public class AuctionOrderRequest {
    private Long productId;
    private String addrId;
    private String req;
    private String orderId;
    private int shippingFee;
    private int totalPrice;
}

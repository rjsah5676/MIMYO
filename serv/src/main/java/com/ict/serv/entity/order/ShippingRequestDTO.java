package com.ict.serv.entity.order;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class ShippingRequestDTO {
    private Long orderId;
    private String invoiceNumber;
}

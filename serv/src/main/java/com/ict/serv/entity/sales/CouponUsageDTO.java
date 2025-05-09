package com.ict.serv.entity.sales;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CouponUsageDTO {
    private int year;
    private int month;
    private long count;
    private long totalDiscount;
}
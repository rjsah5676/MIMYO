package com.ict.serv.entity.sales;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SalesStatsDTO {
    private String date;
    private int orders;
    private int totalPrice;
    private int shippingCost;
    private int couponDiscount;
    private int cancelAmount;
    private int totalSales;
}
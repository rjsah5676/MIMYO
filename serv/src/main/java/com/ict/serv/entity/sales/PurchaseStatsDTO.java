package com.ict.serv.entity.sales;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class PurchaseStatsDTO {
    private int year;
    private int month;
    private long orderCount;
    private BigDecimal totalAmount;  // 금액 합계를 BigDecimal로 처리

    public int getYear() { return year; }
    public int getMonth() { return month; }
    public long getOrderCount() { return orderCount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setOrderCount(long orderCount) { this.orderCount = orderCount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
}
package com.ict.serv.entity.sales;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SellerSalesSummaryDTO {

    private Long totalSalesAmount;  // 판매매출
    private Long totalQuantity;     // 판매수량
    private Long refundOrCancelCount; // 환불/취소 건수
}

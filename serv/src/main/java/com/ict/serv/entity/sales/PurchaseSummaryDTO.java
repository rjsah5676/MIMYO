package com.ict.serv.entity.sales;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PurchaseSummaryDTO {
    private int totalAmount;      // 일반 + 경매
    private int totalCount;
    private int auctionAmount;
    private int auctionCount;
}

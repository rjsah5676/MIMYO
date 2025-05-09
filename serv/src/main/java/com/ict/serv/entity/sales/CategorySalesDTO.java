package com.ict.serv.entity.sales;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategorySalesDTO {
    private String category;
    private Long totalQuantity;
    private Long totalRevenue;
}

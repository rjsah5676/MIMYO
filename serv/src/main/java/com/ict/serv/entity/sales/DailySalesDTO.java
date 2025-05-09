package com.ict.serv.entity.sales;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DailySalesDTO {
    private String date;
    private Long totalAmount;
}
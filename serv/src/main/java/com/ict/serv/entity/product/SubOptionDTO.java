package com.ict.serv.entity.product;


import lombok.Data;

@Data
public class SubOptionDTO {
    private String subOptionName;
    private int quantity;
    private int additionalPrice;
}

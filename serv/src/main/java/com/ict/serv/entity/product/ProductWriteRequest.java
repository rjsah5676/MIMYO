package com.ict.serv.entity.product;


import lombok.Data;

import java.util.List;

@Data
public class ProductWriteRequest {
    Long id;
    private String productName;
    private String eventCategory;
    private String targetCategory;
    private String productCategory;
    private String detail;
    private int price;
    private int quantity;
    private float discountRate;
    private List<OptionDTO> options;
    private int shippingFee;
    private List<String> originalImages;
}
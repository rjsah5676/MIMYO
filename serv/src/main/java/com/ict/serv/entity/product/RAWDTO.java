package com.ict.serv.entity.product;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class RAWDTO {
    private Long id;

    private String productName;

    private int price;

    private int quantity;

    private int shippingFee;

    private int discountRate;

    private ProductImage image;

    private float rating;

    private int rating_count;

    private int wish_count;
}

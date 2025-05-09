package com.ict.serv.dto;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class PopUserDTO {
    private User user;
    private double score;
    private int orderCount;
    private int reviewCount;
    private double reviewAverage;
    private int followerCount;
    private int wishCount;
    private List<Product> productList;
}

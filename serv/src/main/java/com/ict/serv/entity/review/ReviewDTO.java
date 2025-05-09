package com.ict.serv.entity.review;

import lombok.Data;

@Data
public class ReviewDTO {
    private Long productId;
    private String reviewContent;
    private String rate;
}

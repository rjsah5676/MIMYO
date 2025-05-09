package com.ict.serv.dto.recommend;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class WishRecommendRequest {
    private List<Long> productIds;
    private String priceRange;
}

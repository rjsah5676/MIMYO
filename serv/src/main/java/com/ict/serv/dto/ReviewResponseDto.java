package com.ict.serv.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDto {
    private boolean isPurchased;  // 구매 여부
    private boolean isReview;    // 리뷰 작성 여부
}

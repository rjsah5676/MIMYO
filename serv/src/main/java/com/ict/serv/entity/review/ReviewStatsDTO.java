package com.ict.serv.entity.review;

public class ReviewStatsDTO {
    private long reviewCount;
    private double averageRate;

    public ReviewStatsDTO() {}  // 기본 생성자 (필수)

    public ReviewStatsDTO(long reviewCount, double averageRate) {
        this.reviewCount = reviewCount;
        this.averageRate = averageRate;
    }

    public long getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(long reviewCount) {
        this.reviewCount = reviewCount;
    }

    public double getAverageRate() {
        return averageRate;
    }

    public void setAverageRate(double averageRate) {
        this.averageRate = averageRate;
    }
}
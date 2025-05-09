package com.ict.serv.repository.review;

import com.ict.serv.entity.review.Review;
import com.ict.serv.entity.review.ReviewLike;
import com.ict.serv.entity.user.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    int countByReviewId(Long reviewId);

    boolean existsByUserIdAndReviewId(Long userId, Long reviewId);

    int deleteByReviewAndUser(Review review, User user);

    void deleteByReview(Review review);
}

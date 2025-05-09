package com.ict.serv.repository.review;

import com.ict.serv.entity.review.Review;
import com.ict.serv.entity.review.ReviewLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewImageRepository extends JpaRepository<ReviewLike, Long> {

    int deleteByReview(Review review);

}

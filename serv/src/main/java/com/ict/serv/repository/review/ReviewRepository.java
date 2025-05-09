package com.ict.serv.repository.review;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.review.Review;
import com.ict.serv.entity.user.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByUserAndProduct(User user, Product product);

    List<Review> findByProduct(Product product);

    List<Review> findByUser(User user);

    @Query("SELECT r.product.id, AVG(CAST(r.rate AS double)), COUNT(r) FROM Review r GROUP BY r.product.id")
    List<Object[]> getAvgAndCountByProduct();

    List<Review> findAllByProductOrderByReviewWritedateDesc(Product product);

    @Query(value = """
        SELECT COUNT(*)
        FROM review
        WHERE user_id = :userId
          AND YEAR(STR_TO_DATE(review_writedate, '%Y-%m-%d %H:%i:%s')) = :year
          AND (:month IS NULL OR MONTH(STR_TO_DATE(review_writedate, '%Y-%m-%d %H:%i:%s')) = :month)
    """, nativeQuery = true)
    Long countByUserIdAndDate(@Param("userId") Long userId, @Param("year") int year, @Param("month") Integer month);
    int countByProductIn(List<Product> productList);

    @Query(value = """
    SELECT r.rate
    FROM review r
    JOIN product p ON r.product_id = p.product_id
    WHERE p.seller_no = :userId
      AND STR_TO_DATE(r.review_writedate, '%Y-%m-%d %H:%i:%s') 
          BETWEEN STR_TO_DATE(:start, '%Y-%m-%d %H:%i:%s') 
          AND STR_TO_DATE(:end, '%Y-%m-%d %H:%i:%s')
      AND r.rate IS NOT NULL
""", nativeQuery = true)
    List<String> findRatesByUserAndPeriod(
            @Param("userId") Long userId,
            @Param("start") String start,
            @Param("end") String end
    );
}

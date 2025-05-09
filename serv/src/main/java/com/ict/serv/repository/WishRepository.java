package com.ict.serv.repository;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import com.ict.serv.entity.wish.Wishlist;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface WishRepository extends JpaRepository<Wishlist, Long> {
    Wishlist findByUser_IdAndProduct_Id(Long userId, Long productId);

    int countIdByUser(User user);

    List<Wishlist> findAllByUserOrderByIdDesc(User user, PageRequest of);

    @Query(value = "SELECT COUNT(*) " +
            "FROM product p " +
            "JOIN wishlist w ON p.product_id = w.product_no " +
            "WHERE p.seller_no = :sellerId", nativeQuery = true)
    int countWishBySeller(@Param("sellerId") Long sellerId);

    int countIdByProduct(Product product);

    List<Wishlist> findByUser(User user);

    @Query("SELECT w.product.id, COUNT(w) FROM Wishlist w GROUP BY w.product.id")
    List<Object[]> countAllGroupedByProduct();

    @Query(value = """
        SELECT COUNT(*)
        FROM wishlist
        WHERE user_no = :userId
          AND YEAR(STR_TO_DATE(start_date, '%Y-%m-%d %H:%i:%s')) = :year
          AND (:month IS NULL OR MONTH(STR_TO_DATE(start_date, '%Y-%m-%d %H:%i:%s')) = :month)
    """, nativeQuery = true)
    Long countByUserIdAndDate(@Param("userId") Long userId, @Param("year") int year, @Param("month") Integer month);
}

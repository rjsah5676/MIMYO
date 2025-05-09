package com.ict.serv.repository.product;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.product.ProductState;
import com.ict.serv.entity.user.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    int countByProductNameContaining(String searchWord);

    List<Product> findAllByProductNameContainingAndEventCategoryContainingAndTargetCategoryContainingAndProductCategoryContaining(String searchWord, String eventCategory, String targetCategory, String productCategory, PageRequest of);

    List<Product> findAllBySellerNo_Id(long id);
    @Query(value = "SELECT COUNT(*) " +
            "FROM product p " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% " +
            "AND p.product_category IN (:productCategories) AND p.quantity > 0 ",
            nativeQuery = true)
    int countProductsAllCategory(
            @Param("keyword") String keyword,
            @Param("eventCategory") String eventCategory,
            @Param("targetCategory") String targetCategory,
            @Param("productCategories") List<String> productCategories
    );

    @Query(value = "SELECT * " +
            "FROM product p " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% " +
            "AND p.product_category IN (:productCategories) AND (p.state='SOLDOUT' OR p.state='SELL')",
            nativeQuery = true)
    List<Product> findProductsAllCategory(
            @Param("keyword") String keyword,
            @Param("eventCategory") String eventCategory,
            @Param("targetCategory") String targetCategory,
            @Param("productCategories") List<String> productCategories,
            @Param("state") ProductState state,
            PageRequest of
    );

    @Query(value = "SELECT * " +
            "FROM product p " +
            "WHERE p.product_category IN (:productCategories)",
            nativeQuery = true)
    List<Product> findProductsAllCategoryNoPaging(@Param("productCategories") List<String> productCategories);

    @Query(value = "SELECT COUNT(*) " +
            "FROM product p " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% AND p.quantity > 0 ",
            nativeQuery = true)
    int countProductsNoCategory(@Param("keyword") String keyword,
                                @Param("eventCategory") String eventCategory,
                                @Param("targetCategory") String targetCategory);

    @Query(value = "SELECT * " +
            "FROM product p " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% AND (p.state='SOLDOUT' OR p.state='SELL')",
            nativeQuery = true)
    List<Product> findProductsNoCategory(@Param("keyword") String keyword,
                                         @Param("eventCategory") String eventCategory,
                                         @Param("targetCategory") String targetCategory, @Param("state") ProductState state, PageRequest of);

    List<Product> findAllBySellerNo(User user);


    @Query("""
        SELECT p
        FROM Product p
        WHERE p.rating >= 3.5 AND p.quantity > 0 AND p.state='SELL'
        ORDER BY 
            (SELECT COUNT(r) FROM Review r WHERE r.product = p) +
            (SELECT COUNT(w) FROM Wishlist w WHERE w.product = p) 
        DESC
        """)
    List<Product> findTop10PopularProductsByRating();

    @Query(value = "SELECT p.*, COUNT(w.product_no) AS wish_count " +
            "FROM product p " +
            "LEFT JOIN wishlist w ON p.PRODUCT_ID = w.product_no " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% " +
            "AND (p.product_category IN :productCategories) " +
            "AND (p.state='SELL' OR p.state='SOLDOUT') " +
            "GROUP BY p.PRODUCT_ID " +
            "ORDER BY wish_count DESC",
            nativeQuery = true)
    List<Product> findProductsAllCategoryOrderByWishCount(
            @Param("keyword") String keyword,
            @Param("eventCategory") String eventCategory,
            @Param("targetCategory") String targetCategory,
            @Param("productCategories") List<String> productCategories,
            @Param("state") ProductState state,
            PageRequest pageRequest
    );

    @Query(value = "SELECT p.*, COUNT(w.product_no) AS wish_count " +
            "FROM product p " +
            "LEFT JOIN wishlist w ON p.PRODUCT_ID = w.product_no " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% " +
            "AND (p.state='SOLDOUT' OR p.state='SELL') " +
            "GROUP BY p.PRODUCT_ID " +
            "ORDER BY wish_count DESC",
            nativeQuery = true)
    List<Product> findProductsNoCategoryOrderByWishCount(
            @Param("keyword") String keyword,
            @Param("eventCategory") String eventCategory,
            @Param("targetCategory") String targetCategory,
            @Param("state") ProductState state,
            PageRequest pageRequest
    );

    @Query(value = "SELECT p.*, COUNT(r.PRODUCT_ID) AS review_count " +
            "FROM product p " +
            "LEFT JOIN review r ON p.PRODUCT_ID = r.PRODUCT_ID " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% " +
            "AND (p.product_category IN :productCategories) " +
            "AND (p.state='SELL' OR p.state='SOLDOUT') " +
            "GROUP BY p.PRODUCT_ID " +
            "ORDER BY review_count DESC",
            nativeQuery = true)
    List<Product> findProductsAllCategoryOrderByReviewCount(
            @Param("keyword") String keyword,
            @Param("eventCategory") String eventCategory,
            @Param("targetCategory") String targetCategory,
            @Param("productCategories") List<String> productCategories,
            @Param("state") ProductState state,
            PageRequest pageRequest
    );

    @Query(value = "SELECT p.*, COUNT(r.PRODUCT_ID) AS review_count " +
            "FROM product p " +
            "LEFT JOIN review r ON p.PRODUCT_ID = r.PRODUCT_ID " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% " +
            "AND (p.state='SOLDOUT' OR p.state='SELL') " +
            "GROUP BY p.PRODUCT_ID " +
            "ORDER BY review_count DESC",
            nativeQuery = true)
    List<Product> findProductsNoCategoryOrderByReviewCount(
            @Param("keyword") String keyword,
            @Param("eventCategory") String eventCategory,
            @Param("targetCategory") String targetCategory,
            @Param("state") ProductState state,
            PageRequest pageRequest
    );

    @Query(value = "SELECT p.*, COUNT(o.PRODUCT_ID) AS order_count " +
            "FROM product p " +
            "LEFT JOIN orders o ON p.PRODUCT_ID = o.PRODUCT_ID " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% " +
            " AND (p.state='SOLDOUT' OR p.state='SELL') " +
            "GROUP BY p.PRODUCT_ID " +
            "ORDER BY order_count DESC",
            nativeQuery = true)
    List<Product> findProductsNoCategoryOrderByOrderCount(
            @Param("keyword") String keyword,
            @Param("eventCategory") String eventCategory,
            @Param("targetCategory") String targetCategory,
            @Param("state") ProductState state,
            PageRequest of
    );

    @Query(value = "SELECT p.*, COUNT(o.PRODUCT_ID) AS order_count " +
            "FROM product p " +
            "LEFT JOIN orders o ON p.PRODUCT_ID = o.PRODUCT_ID " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% " +
            "AND p.product_category IN (:productCategories) " +
            "AND (p.state='SOLDOUT' OR p.state='SELL') " +
            "GROUP BY p.PRODUCT_ID " +
            "ORDER BY order_count DESC",
            nativeQuery = true)
    List<Product> findProductsAllCategoryOrderByOrderCount(
            @Param("keyword") String keyword,
            @Param("eventCategory") String eventCategory,
            @Param("targetCategory") String targetCategory,
            @Param("productCategories") List<String> productCategories,
            @Param("state") ProductState state,
            PageRequest of
    );

    @Query("SELECT COUNT(p) FROM Product p WHERE p.sellerNo.id = :sellerId AND p.state = com.ict.serv.entity.product.ProductState.SELL")
    long countActiveProductsBySeller(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.sellerNo.id = :userId AND p.startDate BETWEEN :start AND :end")
    Long countBySellerAndDateRange(@Param("userId") Long userId,
                                   @Param("start") String start,
                                   @Param("end") String end);
}

package com.ict.serv.repository.auction;


import com.ict.serv.entity.auction.AuctionProduct;
import com.ict.serv.entity.user.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AuctionProductRepository extends JpaRepository<AuctionProduct, Long> {

    @Query(value = "SELECT COUNT(*) " +
            "FROM auction_product p " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% " +
            "AND p.state = 'SELL'",
            nativeQuery = true)
    int countAuctionProductsNoCategory(@Param("keyword") String keyword,
                                       @Param("eventCategory") String eventCategory,
                                       @Param("targetCategory") String targetCategory);

    @Query(value = "SELECT COUNT(*) " +
            "FROM auction_product p " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% " +
            "AND p.product_category IN (:productCategories)" +
            "AND p.state = 'SELL'",
            nativeQuery = true)
    int countAuctionProductsAllCategory(
            @Param("keyword") String keyword,
            @Param("eventCategory") String eventCategory,
            @Param("targetCategory") String targetCategory,
            @Param("productCategories") List<String> productCategories
    );

    @Query(value = "SELECT * " +
            "FROM auction_product p " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% " +
            "AND p.product_category IN (:productCategories)" +
            "AND p.state = 'SELL'",
            nativeQuery = true)
    List<AuctionProduct> findAuctionProductsAllCategory(
            @Param("keyword") String keyword,
            @Param("eventCategory") String eventCategory,
            @Param("targetCategory") String targetCategory,
            @Param("productCategories") List<String> productCategories
            , PageRequest of
    );

    @Query(value = "SELECT * " +
            "FROM auction_product p " +
            "WHERE p.product_name LIKE %:keyword% " +
            "AND p.event_category LIKE %:eventCategory% " +
            "AND p.target_category LIKE %:targetCategory% " +
            "AND p.state = 'SELL'",
            nativeQuery = true)
    List<AuctionProduct> findAuctionProductsNoCategory(@Param("keyword") String keyword,
                                                       @Param("eventCategory") String eventCategory,
                                                       @Param("targetCategory") String targetCategory, PageRequest of);

    List<AuctionProduct> findAllBySellerNo(User user);
}

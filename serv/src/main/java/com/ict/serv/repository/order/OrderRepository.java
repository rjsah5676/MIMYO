package com.ict.serv.repository.order;

import com.ict.serv.entity.auction.AuctionProduct;
import com.ict.serv.entity.order.OrderGroup;
import com.ict.serv.entity.order.OrderState;
import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.order.ShippingState;
import com.ict.serv.entity.product.HotCategoryDTO;
import com.ict.serv.entity.user.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.hibernate.query.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;

public interface OrderRepository extends JpaRepository<Orders, Long> {
    int countIdByUser(User user);

    List<Orders> findAllByUserOrderByStartDateDesc(User user, PageRequest of);

    List<Orders> findByUserAndProductId(User user, Long productId);

    List<Orders> findAllByOrderGroup(OrderGroup orderGroup);

    @Query(value = "SELECT p.product_category, COUNT(*) AS count " +
            "FROM orders o " +
            "JOIN order_group og ON o.order_group_id = og.order_group_id " +
            "JOIN product p ON o.product_id = p.product_id " +
            "WHERE og.state = 'PAID' " +
            "OR og.state = 'PARTRETURNED' " +
            "AND o.start_date >= NOW() - INTERVAL 14 DAY " +
            "GROUP BY p.product_category " +
            "ORDER BY count DESC " +
            "LIMIT 6", nativeQuery = true)
    List<Object[]> countProductCategoryFromPaidOrdersWithinTwoWeeks();

    @Query(value = """
    SELECT p.product_category AS category,
           SUM(oi.quantity) AS total_quantity,
           SUM(oi.quantity * p.price) AS total_revenue
    FROM order_item oi
    JOIN option_category oc ON oi.option_category_id = oc.option_category_id
    JOIN product_option o ON oc.option_id = o.option_id
    JOIN product p ON o.product_id = p.product_id
    JOIN orders ord ON oi.order_id = ord.order_id
    JOIN order_group og ON ord.order_group_id = og.order_group_id
    WHERE og.state IN ('PAID', 'PARTRETURNED')
    GROUP BY p.product_category
""", nativeQuery = true)
    List<Object[]> getSalesDataByCategory();

    @Query(value = """
    SELECT p.event_category AS category,
           SUM(oi.quantity) AS total_quantity,
           SUM(oi.quantity * p.price) AS total_revenue
    FROM order_item oi
    JOIN option_category oc ON oi.option_category_id = oc.option_category_id
    JOIN product_option po ON oc.option_id = po.option_id
    JOIN product p ON po.product_id = p.product_id
    JOIN orders o ON oi.order_id = o.order_id
    JOIN order_group og ON o.order_group_id = og.order_group_id
    WHERE og.state IN ('PAID', 'PARTRETURNED')
    GROUP BY p.event_category
""", nativeQuery = true)
    List<Object[]> getSalesByEventCategory();

    @Query(value = """
    SELECT p.target_category AS category,
           SUM(oi.quantity) AS total_quantity,
           SUM(oi.quantity * p.price) AS total_revenue
    FROM order_item oi
    JOIN option_category oc ON oi.option_category_id = oc.option_category_id
    JOIN product_option po ON oc.option_id = po.option_id
    JOIN product p ON po.product_id = p.product_id
    JOIN orders o ON oi.order_id = o.order_id
    JOIN order_group og ON o.order_group_id = og.order_group_id
    WHERE og.state IN ('PAID', 'PARTRETURNED')
    GROUP BY p.target_category
""", nativeQuery = true)
    List<Object[]> getSalesByTargetCategory();

    @Query("SELECT oi.product.id, COUNT(oi) FROM OrderItem oi GROUP BY oi.product.id")
    List<Object[]> countAllGroupedByProduct();

    List<Orders> findAllByProductIdOrderByIdDesc(Long id);

    List<Orders> findAllByProductIdAndShippingStateOrderByIdDesc(Long id, ShippingState state);

    List<Orders> findAllByAuctionProductOrderByIdDesc(AuctionProduct auctionProduct);

    List<Orders> findAllByAuctionProductAndShippingStateOrderByIdDesc(AuctionProduct auctionProduct, ShippingState shippingState);

    @Query(value =
            "SELECT u.user_id, u.user_name, u.authority, u.id, " +
            "SUM(((oi.price + oi.additional_fee) - (oi.price * oi.discount_rate / 100)) * oi.quantity + o.shipping_fee) AS total_sales " +
            "FROM orders o " +
            "JOIN product p ON o.product_id = p.product_id " +
            "JOIN users u ON p.seller_no = u.id " +
            "JOIN order_item oi ON oi.order_id = o.order_id " +
            "WHERE o.shipping_state = 'FINISH' " +
            "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " +
            "GROUP BY u.user_id, u.user_name, u.authority, u.id",
            countQuery =
                    "SELECT COUNT(DISTINCT u.user_id) " +
                            "FROM orders o " +
                            "JOIN product p ON o.product_id = p.product_id " +
                            "JOIN users u ON p.seller_no = u.id " +
                            "WHERE o.shipping_state = 'FINISH' " +
                            "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " ,
            nativeQuery = true)
    Page<Map<String, Object>> findSellersWithTotalSalesByConditionsNoYearNoMonth(@Param("year") int year,
                                                            @Param("month") int month,
                                                            @Param("keyword") String keyword,
                                                            Pageable pageable);

    @Query(value =
            "SELECT u.user_id, u.user_name, u.authority, u.id, " +
                    "SUM(((oi.price + oi.additional_fee) - (oi.price * oi.discount_rate / 100)) * oi.quantity + o.shipping_fee) AS total_sales " +
                    "FROM orders o " +
                    "JOIN product p ON o.product_id = p.product_id " +
                    "JOIN users u ON p.seller_no = u.id " +
                    "JOIN order_item oi ON oi.order_id = o.order_id " +
                    "WHERE o.shipping_state = 'FINISH' " +
                    "AND YEAR(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :year " +
                    "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " +
                    "GROUP BY u.user_id, u.user_name, u.authority, u.id ",
            countQuery =
                    "SELECT COUNT(DISTINCT u.user_id) " +
                            "FROM orders o " +
                            "JOIN product p ON o.product_id = p.product_id " +
                            "JOIN users u ON p.seller_no = u.id " +
                            "WHERE o.shipping_state = 'FINISH' " +
                            "AND YEAR(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :year " +
                            "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " ,
            nativeQuery = true)
    Page<Map<String, Object>> findSellersWithTotalSalesByConditionsNoMonth(
            @Param("year") int year,
            @Param("month") int month,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query(value =
            "SELECT u.user_id, u.user_name, u.authority, u.id, " +
                    "SUM(((oi.price + oi.additional_fee) - (oi.price * oi.discount_rate / 100)) * oi.quantity + o.shipping_fee) AS total_sales " +
                    "FROM orders o " +
                    "JOIN product p ON o.product_id = p.product_id " +
                    "JOIN users u ON p.seller_no = u.id " +
                    "JOIN order_item oi ON oi.order_id = o.order_id " +
                    "WHERE o.shipping_state = 'FINISH' " +
                    "AND MONTH(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :month " +
                    "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " +
                    "GROUP BY u.user_id, u.user_name, u.authority, u.id ",
            countQuery =
                    "SELECT COUNT(DISTINCT u.user_id) " +
                            "FROM orders o " +
                            "JOIN product p ON o.product_id = p.product_id " +
                            "JOIN users u ON p.seller_no = u.id " +
                            "WHERE o.shipping_state = 'FINISH' " +
                            "AND MONTH(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :month " +
                            "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) ",
            nativeQuery = true)
    Page<Map<String, Object>> findSellersWithTotalSalesByConditionsNoYear(
            @Param("month") int month,
            @Param("keyword") String keyword,
            Pageable pageable);


    @Query(value =
            "SELECT u.user_id, u.user_name, u.authority, u.id, " +
                    "SUM(((oi.price + oi.additional_fee) - (oi.price * oi.discount_rate / 100)) * oi.quantity + o.shipping_fee) AS total_sales " +
                    "FROM orders o " +
                    "JOIN product p ON o.product_id = p.product_id " +
                    "JOIN users u ON p.seller_no = u.id " +
                    "JOIN order_item oi ON oi.order_id = o.order_id " +
                    "WHERE o.shipping_state = 'FINISH' " +
                    "AND YEAR(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :year " +
                    "AND MONTH(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :month " +
                    "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " +
                    "GROUP BY u.user_id, u.user_name, u.authority, u.id ",

            countQuery =
                    "SELECT COUNT(DISTINCT u.user_id) " +
                            "FROM orders o " +
                            "JOIN product p ON o.product_id = p.product_id " +
                            "JOIN users u ON p.seller_no = u.id " +
                            "WHERE o.shipping_state = 'FINISH' " +
                            "AND YEAR(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :year " +
                            "AND MONTH(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :month " +
                            "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " ,
            nativeQuery = true)
    Page<Map<String, Object>> findSellersWithTotalSalesByConditions(@Param("year") int year,
                                                                    @Param("month") int month,
                                                                    @Param("keyword") String keyword,
                                                                    Pageable pageable);

    List<Orders> findAllByProductSellerNoAndShippingState(User user, ShippingState shippingState);

    @Query(value =
            "SELECT o.* FROM orders o " +
                    "JOIN product p ON o.product_id = p.product_id " +
                    "WHERE p.seller_no = :userId " +
                    "AND o.shipping_state = :shippingState " +
                    "AND o.modified_date IS NOT NULL " +
                    "AND YEAR(STR_TO_DATE(LEFT(o.modified_date, 19), '%Y-%m-%d %H:%i:%s')) = :year " +
                    "AND MONTH(STR_TO_DATE(LEFT(o.modified_date, 19), '%Y-%m-%d %H:%i:%s')) = :month " +
                    "ORDER BY o.modified_date DESC",
            nativeQuery = true)
    List<Orders> findAllByProductSellerNoAndShippingStateAndYearAndMonth(
            @Param("userId") Long userId,
            @Param("shippingState") String shippingState,
            @Param("year") int year,
            @Param("month") int month);

    @Query(value =
            "SELECT o.* FROM orders o " +
                    "JOIN product p ON o.product_id = p.product_id " +
                    "WHERE p.seller_no = :userId " +
                    "AND o.shipping_state = :shippingState " +
                    "AND o.modified_date IS NOT NULL " +
                    "AND YEAR(STR_TO_DATE(LEFT(o.modified_date, 19), '%Y-%m-%d %H:%i:%s')) = :year " +
                    "ORDER BY o.modified_date DESC",
            nativeQuery = true)
    List<Orders> findAllByProductSellerNoAndShippingStateAndYear(
            @Param("userId") Long userId,
            @Param("shippingState") String shippingState,
            @Param("year") int year);

    @Query(value =
            "SELECT o.* FROM orders o " +
                    "JOIN product p ON o.product_id = p.product_id " +
                    "WHERE p.seller_no = :userId " +
                    "AND o.shipping_state = :shippingState " +
                    "AND o.modified_date IS NOT NULL " +
                    "AND MONTH(STR_TO_DATE(LEFT(o.modified_date, 19), '%Y-%m-%d %H:%i:%s')) = :month " +
                    "ORDER BY o.modified_date DESC",
            nativeQuery = true)
    List<Orders> findAllByProductSellerNoAndShippingStateAndMonth(
            @Param("userId") Long userId,
            @Param("shippingState") String shippingState,
            @Param("month") int month);

    List<Orders> findByShippingState(ShippingState shippingState);

    @Query(value =
            "SELECT u.user_id, u.user_name, u.authority, u.id, " +
                    "SUM(((oi.price + oi.additional_fee) - (oi.price * oi.discount_rate / 100)) * oi.quantity + o.shipping_fee) AS total_sales " +
                    "FROM orders o " +
                    "JOIN product p ON o.product_id = p.product_id " +
                    "JOIN users u ON p.seller_no = u.id " +
                    "JOIN order_item oi ON oi.order_id = o.order_id " +
                    "WHERE o.shipping_state = 'SETTLED' " +
                    "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " +
                    "GROUP BY u.user_id, u.user_name, u.authority, u.id",
            countQuery =
                    "SELECT COUNT(DISTINCT u.user_id) " +
                            "FROM orders o " +
                            "JOIN product p ON o.product_id = p.product_id " +
                            "JOIN users u ON p.seller_no = u.id " +
                            "WHERE o.shipping_state = 'SETTLED' " +
                            "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " ,
            nativeQuery = true)
    Page<Map<String, Object>> findSettledListWithTotalSalesByConditionsNoYearNoMonth(@Param("year") int year,
                                                                                 @Param("month") int month,
                                                                                 @Param("keyword") String keyword,
                                                                                 Pageable pageable);

    @Query(value =
            "SELECT u.user_id, u.user_name, u.authority, u.id, " +
                    "SUM(((oi.price + oi.additional_fee) - (oi.price * oi.discount_rate / 100)) * oi.quantity + o.shipping_fee) AS total_sales " +
                    "FROM orders o " +
                    "JOIN product p ON o.product_id = p.product_id " +
                    "JOIN users u ON p.seller_no = u.id " +
                    "JOIN order_item oi ON oi.order_id = o.order_id " +
                    "WHERE o.shipping_state = 'SETTLED' " +
                    "AND MONTH(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :month " +
                    "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " +
                    "GROUP BY u.user_id, u.user_name, u.authority, u.id ",
            countQuery =
                    "SELECT COUNT(DISTINCT u.user_id) " +
                            "FROM orders o " +
                            "JOIN product p ON o.product_id = p.product_id " +
                            "JOIN users u ON p.seller_no = u.id " +
                            "WHERE o.shipping_state = 'SETTLED' " +
                            "AND MONTH(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :month " +
                            "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) ",
            nativeQuery = true)
    Page<Map<String, Object>> findSettledListWithTotalSalesByConditionsNoYear(
            @Param("month") int month,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query(value =
            "SELECT u.user_id, u.user_name, u.authority, u.id, " +
                    "SUM(((oi.price + oi.additional_fee) - (oi.price * oi.discount_rate / 100)) * oi.quantity + o.shipping_fee) AS total_sales " +
                    "FROM orders o " +
                    "JOIN product p ON o.product_id = p.product_id " +
                    "JOIN users u ON p.seller_no = u.id " +
                    "JOIN order_item oi ON oi.order_id = o.order_id " +
                    "WHERE o.shipping_state = 'SETTLED' " +
                    "AND YEAR(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :year " +
                    "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " +
                    "GROUP BY u.user_id, u.user_name, u.authority, u.id ",
            countQuery =
                    "SELECT COUNT(DISTINCT u.user_id) " +
                            "FROM orders o " +
                            "JOIN product p ON o.product_id = p.product_id " +
                            "JOIN users u ON p.seller_no = u.id " +
                            "WHERE o.shipping_state = 'SETTLED' " +
                            "AND YEAR(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :year " +
                            "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " ,
            nativeQuery = true)
    Page<Map<String, Object>> findSettledListWithTotalSalesByConditionsNoMonth(
            @Param("year") int year,
            @Param("month") int month,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query(value =
            "SELECT u.user_id, u.user_name, u.authority, u.id, " +
                    "SUM(((oi.price + oi.additional_fee) - (oi.price * oi.discount_rate / 100)) * oi.quantity + o.shipping_fee) AS total_sales " +
                    "FROM orders o " +
                    "JOIN product p ON o.product_id = p.product_id " +
                    "JOIN users u ON p.seller_no = u.id " +
                    "JOIN order_item oi ON oi.order_id = o.order_id " +
                    "WHERE o.shipping_state = 'SETTLED' " +
                    "AND YEAR(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :year " +
                    "AND MONTH(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :month " +
                    "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " +
                    "GROUP BY u.user_id, u.user_name, u.authority, u.id ",

            countQuery =
                    "SELECT COUNT(DISTINCT u.user_id) " +
                            "FROM orders o " +
                            "JOIN product p ON o.product_id = p.product_id " +
                            "JOIN users u ON p.seller_no = u.id " +
                            "WHERE o.shipping_state = 'SETTLED' " +
                            "AND YEAR(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :year " +
                            "AND MONTH(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :month " +
                            "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " ,
            nativeQuery = true)
    Page<Map<String, Object>> findSettledListWithTotalSalesByConditions(@Param("year") int year,
                                                                    @Param("month") int month,
                                                                    @Param("keyword") String keyword,
                                                                    Pageable pageable);

    @Query("""
    SELECT o
    FROM Orders o
    WHERE o.user.id = :userId
      AND o.auctionProduct IS NOT NULL
      AND o.shippingState = com.ict.serv.entity.order.ShippingState.SETTLED
""")
    List<Orders> findSettledAuctionOrdersByUser(@Param("userId") Long userId);

    List<Orders> findAllByProductIdAndShippingStateNotOrderByIdDesc(Long id, ShippingState shippingState);

    List<Orders> findAllByAuctionProductAndShippingStateNotOrderByIdDesc(AuctionProduct auctionProduct, ShippingState shippingState);

    @Query(value =
            "SELECT DATE_FORMAT(o.modified_date, '%Y-%m') AS settle_month, u.user_id, u.user_name, u.authority, u.id, +" +
                    "SUM(((oi.price + oi.additional_fee) - (oi.price * oi.discount_rate / 100)) * oi.quantity + o.shipping_fee) AS total_sales " +
                    "FROM orders o " +
                    "JOIN product p ON o.product_id = p.product_id " +
                    "JOIN users u ON p.seller_no = u.id " +
                    "JOIN order_item oi ON oi.order_id = o.order_id " +
                    "WHERE o.shipping_state = 'SETTLED' AND u.id = :userId " +
                    "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " +
                    "GROUP BY DATE_FORMAT(o.modified_date, '%Y-%m') " +
                    "ORDER BY settle_month DESC",
            countQuery =
                    "SELECT COUNT(DISTINCT DATE_FORMAT(o.modified_date, '%Y-%m')) " +
                            "FROM orders o " +
                            "JOIN product p ON o.product_id = p.product_id " +
                            "JOIN users u ON p.seller_no = u.id " +
                            "WHERE o.shipping_state = 'SETTLED' AND u.id = :userId " +
                            "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) ",
            nativeQuery = true)
        Page<Map<String, Object>> findMonthlySettledSalesByUser(@Param("userId") Long userId,
                                                                @Param("keyword") String keyword,
                                                                Pageable pageable);

    @Query(value =
            "SELECT u.user_id, u.user_name, u.authority, u.id, " +
                    "SUM(((oi.price + oi.additional_fee) - (oi.price * oi.discount_rate / 100)) * oi.quantity + o.shipping_fee) AS total_sales " +
                    "FROM orders o " +
                    "JOIN product p ON o.product_id = p.product_id " +
                    "JOIN users u ON p.seller_no = u.id " +
                    "JOIN order_item oi ON oi.order_id = o.order_id " +
                    "WHERE o.shipping_state = 'SETTLED' AND u.id = :userId " +
                    "AND MONTH(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :month " +
                    "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " +
                    "GROUP BY u.user_id, u.user_name, u.authority, u.id ",
            countQuery =
                    "SELECT COUNT(DISTINCT u.user_id) " +
                            "FROM orders o " +
                            "JOIN product p ON o.product_id = p.product_id " +
                            "JOIN users u ON p.seller_no = u.id " +
                            "WHERE o.shipping_state = 'SETTLED' AND u.id = :userId " +
                            "AND MONTH(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :month " +
                            "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) ",
            nativeQuery = true)
    Page<Map<String, Object>> findSettledListWithTotalSalesByConditionsNoYearAndUserId(
            @Param("month") int month,
            @Param("keyword") String keyword,
            @Param("userId") Long userId,
            Pageable pageable);
    @Query(value =
            "SELECT u.user_id, u.user_name, u.authority, u.id, " +
                    "SUM(((oi.price + oi.additional_fee) - (oi.price * oi.discount_rate / 100)) * oi.quantity + o.shipping_fee) AS total_sales " +
                    "FROM orders o " +
                    "JOIN product p ON o.product_id = p.product_id " +
                    "JOIN users u ON p.seller_no = u.id " +
                    "JOIN order_item oi ON oi.order_id = o.order_id " +
                    "WHERE o.shipping_state = 'SETTLED' AND u.id = :userId " +
                    "AND YEAR(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :year " +
                    "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " +
                    "GROUP BY u.user_id, u.user_name, u.authority, u.id ",
            countQuery =
                    "SELECT COUNT(DISTINCT u.user_id) " +
                            "FROM orders o " +
                            "JOIN product p ON o.product_id = p.product_id " +
                            "JOIN users u ON p.seller_no = u.id " +
                            "WHERE o.shipping_state = 'SETTLED' AND u.id = :userId " +
                            "AND YEAR(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :year " +
                            "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " ,
            nativeQuery = true)
    Page<Map<String, Object>> findSettledListWithTotalSalesByConditionsNoMonthAndUserId(
            @Param("year") int year,
            @Param("month") int month,
            @Param("keyword") String keyword,
            @Param("userId") Long userId,
            Pageable pageable);
    @Query(value =
            "SELECT u.user_id, u.user_name, u.authority, u.id, " +
                    "SUM(((oi.price + oi.additional_fee) - (oi.price * oi.discount_rate / 100)) * oi.quantity + o.shipping_fee) AS total_sales " +
                    "FROM orders o " +
                    "JOIN product p ON o.product_id = p.product_id " +
                    "JOIN users u ON p.seller_no = u.id " +
                    "JOIN order_item oi ON oi.order_id = o.order_id " +
                    "WHERE o.shipping_state = 'SETTLED' AND u.id = :userId " +
                    "AND YEAR(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :year " +
                    "AND MONTH(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :month " +
                    "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " +
                    "GROUP BY u.user_id, u.user_name, u.authority, u.id ",

            countQuery =
                    "SELECT COUNT(DISTINCT u.user_id) " +
                            "FROM orders o " +
                            "JOIN product p ON o.product_id = p.product_id " +
                            "JOIN users u ON p.seller_no = u.id " +
                            "WHERE o.shipping_state = 'SETTLED' AND u.id = :userId " +
                            "AND YEAR(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :year " +
                            "AND MONTH(STR_TO_DATE(o.modified_date, '%Y-%m-%d %H:%i:%s')) = :month " +
                            "AND (u.user_id LIKE %:keyword% OR u.user_name LIKE %:keyword%) " ,
            nativeQuery = true)
    Page<Map<String, Object>> findSettledListWithTotalSalesByConditionsAndUserId(@Param("year") int year,
                                                                        @Param("month") int month,
                                                                        @Param("keyword") String keyword,
                                                                        @Param("userId") Long userId,
                                                                        Pageable pageable);

    List<Orders> findAllByProductIdAndShippingStateInOrderByIdDesc(Long id, List<ShippingState> states);
}

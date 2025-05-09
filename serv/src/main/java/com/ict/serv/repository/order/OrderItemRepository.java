package com.ict.serv.repository.order;

import com.ict.serv.entity.order.OrderItem;
import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.sales.DailySalesDTO;
import com.ict.serv.entity.sales.SellerSalesSummaryDTO;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findAllByOrder(Orders orders);

    @Query("""
    SELECT new com.ict.serv.entity.sales.SellerSalesSummaryDTO(
        SUM(
            CASE 
                WHEN o.shippingState = com.ict.serv.entity.order.ShippingState.SETTLED
                THEN ((oi.price * (100 - oi.discountRate) / 100) + oi.additionalFee) * oi.quantity
                ELSE 0
            END
        ),
        SUM(
            CASE 
                WHEN o.shippingState = com.ict.serv.entity.order.ShippingState.SETTLED
                THEN oi.quantity
                ELSE 0
            END
        ),
        COUNT(
            CASE 
                WHEN o.shippingState IN (
                    com.ict.serv.entity.order.ShippingState.CANCELED,
                    com.ict.serv.entity.order.ShippingState.SELLERCANCELED,
                    com.ict.serv.entity.order.ShippingState.RETURNED
                ) THEN oi.id
                ELSE null
            END
        )
    )
    FROM OrderItem oi
    JOIN oi.order o
    JOIN o.product p
    WHERE p.sellerNo.id = :sellerId
      AND FUNCTION('DATE', o.startDate) BETWEEN :start AND :end
""")
    SellerSalesSummaryDTO getSalesSummaryBySellerAndDate(
            @Param("sellerId") Long sellerId,
            @Param("start") String start,  // '2025-04-01'
            @Param("end") String end       // '2025-04-30'
    );
    @Query(value = """
    SELECT 
        DATE_FORMAT(o.start_date, '%Y-%m-%d') AS date,
        SUM(((oi.price * (100 - oi.discount_rate) / 100) + oi.additional_fee) * oi.quantity) AS totalAmount
    FROM order_item oi
    JOIN orders o ON oi.order_id = o.order_id
    JOIN product p ON o.product_id = p.product_id
    WHERE p.seller_no = :sellerId
      AND o.shipping_state = 'SETTLED'
      AND DATE(o.start_date) BETWEEN :start AND :end
    GROUP BY DATE_FORMAT(o.start_date, '%Y-%m-%d')
    ORDER BY DATE_FORMAT(o.start_date, '%Y-%m-%d')
""", nativeQuery = true)
    List<Object[]> getDailySalesNative(
            @Param("sellerId") Long sellerId,
            @Param("start") String start,
            @Param("end") String end
    );
}

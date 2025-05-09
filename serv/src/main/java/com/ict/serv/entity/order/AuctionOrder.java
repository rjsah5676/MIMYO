package com.ict.serv.entity.order;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class AuctionOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AUCTION_ORDER_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;

    @CreationTimestamp
    @Column(columnDefinition = "DATETIME default now()")
    private String orderDate;

    @Column(name = "total_price", columnDefinition = "int default 0")
    private int totalPrice;

    @Column(name = "total_shipping_fee", columnDefinition = "int default 0")
    private int totalShippingFee;

    @Enumerated(EnumType.STRING)
    private OrderState state = OrderState.BEFORE;

    @Column(name="auction_product_id")
    private Long auctionProductId;
}



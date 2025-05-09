package com.ict.serv.entity.order;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ict.serv.entity.auction.AuctionProduct;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.Address;
import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ORDER_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;

    @CreationTimestamp
    @Column(columnDefinition = "DATETIME default now()")
    private String startDate;

    @UpdateTimestamp
    private String modifiedDate;

    @ManyToOne
    @JoinColumn(name = "ORDER_GROUP_ID")
    @JsonBackReference
    private OrderGroup orderGroup;

    @ManyToOne
    @JoinColumn(name = "ADDRESS_ID")
    private Address address;

    private String request;

    private String orderNum;

    @Column(name="shipping_fee", columnDefinition = "int default 0")
    private int shippingFee;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<OrderItem> orderItems = new ArrayList<>();

    @Column(name="product_id")
    private Long productId;

    @Column(name="shipping_state")
    @Enumerated(EnumType.STRING)
    ShippingState shippingState;

    @ManyToOne
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "auction_product_id")
    private AuctionProduct auctionProduct;
}

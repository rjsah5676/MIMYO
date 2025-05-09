package com.ict.serv.entity.order;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ict.serv.entity.auction.AuctionProduct;
import com.ict.serv.entity.user.Address;
import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.ArrayList;
import java.util.List;

@Data
public class OrdersDTO {
    private Long id;

    private User user;

    private String startDate;

    private String modifiedDate;

    private OrderGroup orderGroup;

    private Address address;

    private String request;

    private String orderNum;

    private int shippingFee;

    private List<OrderItem> orderItems = new ArrayList<>();

    private Long productId;

    private AuctionProduct auctionProduct;

    private int deposit;

    private String filename;

    ShippingState shippingState;
}

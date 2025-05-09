package com.ict.serv.entity.order;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.util.ArrayList;
import java.util.List;

@Data
public class OrderGroupDTO {

    private Long id;

    private User user;

    private String orderDate;

    private int totalPrice;

    private int totalShippingFee;

    private OrderState state = OrderState.BEFORE;

    private List<OrdersDTO> orders = new ArrayList<>();

    private int couponDiscount;

    private String filename;

    private Long productId;

    private int cancelAmount;

    private int deposit;
}


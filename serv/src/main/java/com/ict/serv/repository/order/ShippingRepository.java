package com.ict.serv.repository.order;


import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.order.Shipping;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShippingRepository extends JpaRepository<Shipping, Long> {
    List<Shipping> findAllByOrders(Orders orders);
}


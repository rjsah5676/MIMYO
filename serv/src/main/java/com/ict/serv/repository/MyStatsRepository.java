package com.ict.serv.repository;

import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.order.ShippingState;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MyStatsRepository extends JpaRepository<Orders, Long> {
    List<Orders> findByUserIdAndShippingStateIn(Long userId, List<ShippingState> states);
}

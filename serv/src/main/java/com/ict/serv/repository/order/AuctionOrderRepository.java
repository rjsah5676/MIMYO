package com.ict.serv.repository.order;

import com.ict.serv.entity.order.AuctionOrder;
import com.ict.serv.entity.order.OrderState;
import com.ict.serv.entity.order.Orders;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AuctionOrderRepository extends JpaRepository<AuctionOrder, Long> {
    List<AuctionOrder> findAllByState(OrderState orderState);

    Optional<AuctionOrder> findById(Long id);

    Optional<AuctionOrder> findByAuctionProductId(Long auctionProductId);
}

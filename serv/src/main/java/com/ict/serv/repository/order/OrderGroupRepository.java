package com.ict.serv.repository.order;

import com.ict.serv.entity.order.OrderGroup;
import com.ict.serv.entity.order.OrderState;
import com.ict.serv.entity.user.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderGroupRepository extends JpaRepository<OrderGroup, Long> {
    int countIdByUserAndState(User user, OrderState state);

    List<OrderGroup> findAllByUserAndStateOrderByOrderDateDesc(User user, OrderState state, PageRequest of);

    int countIdByUser(User user);

    List<OrderGroup> findAllByUserOrderByOrderDateDesc(User user, PageRequest of);

    List<OrderGroup> findAllByState(OrderState orderState);

    List<OrderGroup> findAllByStateIn(List<OrderState> states);

}


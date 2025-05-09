package com.ict.serv.repository.basket;

import com.ict.serv.entity.basket.Basket;
import com.ict.serv.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BasketRepository extends JpaRepository<Basket, Long> {

    List<Basket> findByUserNo(User user);

    List<Basket> findByUserNoAndIdIn(User user, List<Long> ids);

    Optional<Basket> findByIdAndUserNo(Long id, User user);
}

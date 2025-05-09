package com.ict.serv.repository;

import com.ict.serv.entity.coupon.Coupon;
import com.ict.serv.entity.coupon.CouponState;
import com.ict.serv.entity.user.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    List<Coupon> findAllByTypeAndUser(String type, User user);

    List<Coupon> findAllByStateAndUser(CouponState state, User user);

    int countIdByUser(User user);

    int countIdByUserAndState(User user, CouponState state);

    List<Coupon> findAllByUserAndStateOrderByIdDesc(User user, CouponState state, PageRequest of);

    List<Coupon> findAllByUserOrderByIdDesc(User user);

    @Query("""
    SELECT 
        FUNCTION('YEAR', c.useDate),
        FUNCTION('MONTH', c.useDate),
        COUNT(c.id),
        SUM(c.discount)
    FROM Coupon c
    WHERE c.user.id = :userId
      AND c.state = 'EXPIRED'
      AND c.useDate IS NOT NULL
    GROUP BY FUNCTION('YEAR', c.useDate), FUNCTION('MONTH', c.useDate)
""")
    List<Object[]> getUsedCouponStatsByUser(@Param("userId") Long userId);
    List<Coupon> findAllByUserOrderByIdDesc(User user, PageRequest of);
}

package com.ict.serv.service;

import com.ict.serv.entity.PointType;
import com.ict.serv.entity.UserPoint;
import com.ict.serv.entity.coupon.Coupon;
import com.ict.serv.entity.coupon.CouponState;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.CouponRepository;
import com.ict.serv.repository.UserPointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CouponService {
    private final CouponRepository couponRepository;
    private final UserPointRepository userPointRepository;

    public List<Coupon> findCouponByType(String type, User user) {
        return couponRepository.findAllByTypeAndUser(type, user);
    }
    public List<Coupon> findCouponByState(CouponState state, User user) {
        return couponRepository.findAllByStateAndUser(state,user);
    }
    public void saveCoupon(Coupon coupon) {
        couponRepository.save(coupon);
    }
    public Optional<Coupon> selectCoupon(Long couponId){
        return couponRepository.findById(couponId);
    }
    public List<UserPoint> selectUserPointByMelon(PointType type, User user){
        return userPointRepository.findByTypeAndUserIdAndLastSpinDate(type,user.getId(), LocalDate.now());
    }
}

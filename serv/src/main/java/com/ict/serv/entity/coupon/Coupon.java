package com.ict.serv.entity.coupon;

import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="coupon_name")
    private String couponName;

    @Column(name="start_date")
    private LocalDateTime startDate;

    @Column(name="use_date")
    private LocalDateTime useDate;

    @Column(name="end_date")
    private LocalDateTime endDate;

    @ManyToOne
    @JoinColumn(name="user_no")
    private User user;

    private int discount;

    private String type;

    @Enumerated(EnumType.STRING)
    private CouponState state;
}

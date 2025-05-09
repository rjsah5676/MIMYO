package com.ict.serv.entity.order;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class OrderGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ORDER_GROUP_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;

    @CreationTimestamp
    @Column(columnDefinition = "DATETIME default now()")
    private String orderDate;

    @Column(name = "total_price", columnDefinition = "int default 0")
    private int totalPrice;

    @Column(name = "total_shipping_fee", columnDefinition = "int default 0")
    private int totalShippingFee;

    @Enumerated(EnumType.STRING)
    private OrderState state = OrderState.BEFORE;

    @OneToMany(mappedBy = "orderGroup", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Orders> orders = new ArrayList<>();

    @Column(name="coupon_discount", columnDefinition = "int default 0")
    private int couponDiscount;

    @Column(name = "payment_key")
    private String paymentKey; // 토스에서 결제 고유 키

    @Column(name = "order_id_pg")
    private String orderIdPg; // 토스에서 전달한 주문 ID

    @Column(name = "payment_method")
    private String paymentMethod; // 결제 수단 (CARD, ACCOUNT 등)

    @Column(name = "pay_done")
    private Boolean payDone = false; // 결제 완료 여부

    @Column(name = "paid_at")
    private LocalDateTime paidAt; // 결제 완료 시각

    @Column(name = "cancel_reason")
    private String cancelReason; // 취소 사유 (환불 시 기록)

    @Column(name = "cancel_amount", columnDefinition = "int default 0")
    private int cancelAmount; // 환불 금액 (부분 환불이면 누적 기록)

    @Column(name = "is_cancelled")
    private Boolean isCancelled = false;
}
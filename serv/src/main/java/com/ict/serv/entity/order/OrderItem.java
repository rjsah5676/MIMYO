package com.ict.serv.entity.order;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.ict.serv.entity.product.Product;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ORDER_ITEM_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ORDER_ID")
    @JsonBackReference
    private Orders order;

    private int price;

    @Column(name="additional_fee")
    private int additionalFee;

    @Column(name="discount_rate")
    private int discountRate;

    private int quantity;

    @Column(name="option_category_id")
    private Long optionCategoryId;

    @Column(name="product_name")
    private String productName;

    @Column(name="option_name")
    private String optionName;

    @Column(name="option_category_name")
    private String optionCategoryName;

    @Column(name="refund_state")
    @Enumerated(EnumType.STRING)
    RefundState refundState=RefundState.NONE;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    public void applyRefund(int refundQuantity) {
        // 부분 환불 처리 로직: 환불 수량에 맞는 금액 계산
        int refundAmount = (this.price * (100 - this.discountRate) / 100 + this.additionalFee) * refundQuantity;
        if (refundAmount > 0) {
            this.refundState = RefundState.COMPLETED; // 환불 상태 업데이트
            this.order.getOrderGroup().setCancelAmount(this.order.getOrderGroup().getCancelAmount() + refundAmount); // OrderGroup의 환불 금액 누적
        }
    }
}

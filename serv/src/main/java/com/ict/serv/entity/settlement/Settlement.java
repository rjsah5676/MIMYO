package com.ict.serv.entity.settlement;

import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "settlement")
public class Settlement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SETTLEMENT_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;

    @ManyToOne
    @JoinColumn(name = "ORDER_ID")
    private Orders orders;

    @CreationTimestamp
    private LocalDateTime createDate;

    private int totalSettlePrice;
}

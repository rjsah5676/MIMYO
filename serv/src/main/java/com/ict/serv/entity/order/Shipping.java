package com.ict.serv.entity.order;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Shipping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    ShippingState state;

    @Column(name="invoice_number")
    private String invoiceNumber;

    private String location;

    @CreationTimestamp
    private LocalDateTime start_time;

    @CreationTimestamp
    private LocalDateTime end_time;

    @ManyToOne
    @JoinColumn(name="order_no")
    Orders orders;
}

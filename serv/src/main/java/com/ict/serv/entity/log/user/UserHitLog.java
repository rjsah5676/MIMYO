package com.ict.serv.entity.log.user;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name="USER_HIT_LOG")
@NoArgsConstructor
public class UserHitLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    private String ip;

    @CreationTimestamp
    private LocalDateTime date;
}

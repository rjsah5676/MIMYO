package com.ict.serv.entity.wish;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name ="WISHLIST")
public class Wishlist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="WISH_ID")
    private Long id;

    @CreationTimestamp
    @Column(name="start_date",columnDefinition = "DATETIME DEFAULT NOW()")
    private String startDate;

    @ManyToOne
    @JoinColumn(name="user_no")
    private User user;

    @ManyToOne
    @JoinColumn(name="product_no")
    private Product product;
}

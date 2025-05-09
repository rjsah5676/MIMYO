package com.ict.serv.entity.review;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.product.ProductImage;
import com.ict.serv.entity.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name="REVIEW")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="REVIEW_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "PRODUCT_ID")
    private Product product;

    @ManyToOne
    @JoinColumn(name="USER_ID", nullable = false)
    private User user;

    @Column(name="REVIEW_CONTENT", nullable = false)
    private String reviewContent;

    private String rate;

    @CreationTimestamp
    @Column(columnDefinition = "DATETIME default now()", name="REVIEW_WRITEDATE", nullable = false)
    private String reviewWritedate;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ReviewImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ReviewLike> likes = new ArrayList<>();
}

package com.ict.serv.entity.review;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.ict.serv.entity.product.Product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name ="REVIEW_IMAGE")
public class ReviewImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="REVIEW_IMAGE_ID")
    private Long id;

    @Column(nullable = false)
    private String filename;

    private int size;

    @ManyToOne
    @JoinColumn(name="REVIEW_ID")
    @OnDelete(action= OnDeleteAction.CASCADE)
    @JsonBackReference
    private Review review;
}

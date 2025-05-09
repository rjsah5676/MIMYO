package com.ict.serv.entity.product;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name ="PRODUCT")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="PRODUCT_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name="seller_no")
    private User sellerNo;

    @Column(name="product_name")
    private String productName;

    @Column(name="event_category")
    private String eventCategory;

    @Column(name="target_category")
    private String targetCategory;

    @Column(name="product_category")
    private String productCategory;

    @Column(columnDefinition = "LONGTEXT")
    private String detail;
    private Integer price;
    private int quantity;

    @Column(name="shipping_fee")
    private int shippingFee;

    @CreationTimestamp
    @Column(columnDefinition = "DATETIME default now()")
    private String startDate;
    private String endDate;

    @Column(columnDefinition = "int default 0.0")
    private int discountRate;

    @Enumerated(EnumType.STRING)
    private ProductState state = ProductState.SELL;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ProductImage> images = new ArrayList<>();

    @Column(columnDefinition = "float default 0.0")
    private float rating;
}

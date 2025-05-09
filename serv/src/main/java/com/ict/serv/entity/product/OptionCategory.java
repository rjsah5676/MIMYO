package com.ict.serv.entity.product;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ict.serv.entity.basket.Basket;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "OPTION_CATEGORY")
public class OptionCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OPTION_CATEGORY_ID")
    private Long id;

    @Column(name = "category_name")
    private String categoryName;  // 예: "색상", "사이즈"

    @ManyToOne
    @JoinColumn(name = "OPTION_ID")
    @JsonBackReference
    private Option option;

    private int quantity;

    private int additionalPrice;  // 소분류 추가 → 금액
}

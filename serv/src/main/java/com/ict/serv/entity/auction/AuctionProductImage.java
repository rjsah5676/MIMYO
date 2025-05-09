package com.ict.serv.entity.auction;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
@Table(name ="AUCTION_PRODUCT_IMAGE")
public class AuctionProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="AUCTION_PRODUCT_IMAGE_NO")
    private Long id;

    @Column(nullable = false)
    private String filename;

    private int size;

    @ManyToOne
    @JoinColumn(name="AUCTION_PRODUCT_NO")
    @OnDelete(action= OnDeleteAction.CASCADE)
    @JsonBackReference
    private AuctionProduct auctionProduct;
}

package com.ict.serv.entity.auction;

import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionRoom {
    @Id
    private String roomId;

    @Enumerated(EnumType.STRING)
    private AuctionState state;

    @ManyToOne
    @JoinColumn(name="auction_product_id")
    private AuctionProduct auctionProduct;

    private String subject;

    private LocalDateTime createdAt;

    @Column(name = "last_bid_time")
    private LocalDateTime lastBidTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "min_bid_increment")
    private int minBidIncrement;

    @Column(name = "first_price")
    private int firstPrice;

    @Column(name = "buy_now_price")
    private int buyNowPrice;

    @Column(name = "current_price")
    private int currentPrice;

    @Column(name = "highest_bidder_id")
    private Long highestBidderId;

    private int deposit;

    @Column(columnDefinition = "int default 0")
    private int hit;
}

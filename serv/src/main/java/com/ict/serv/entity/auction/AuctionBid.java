package com.ict.serv.entity.auction;

import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.lang.reflect.Type;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionBid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "buyer_no")
    private User user;

    private int price;

    private LocalDateTime bidTime;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private AuctionRoom room;

    @Enumerated(EnumType.STRING)
    private BidState state = BidState.LIVE;
}

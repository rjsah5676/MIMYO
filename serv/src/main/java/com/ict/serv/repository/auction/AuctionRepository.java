package com.ict.serv.repository.auction;

import com.ict.serv.entity.auction.AuctionProduct;
import com.ict.serv.entity.auction.AuctionRoom;
import com.ict.serv.entity.auction.AuctionState;
import com.ict.serv.entity.product.ProductState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuctionRepository extends JpaRepository<AuctionRoom, String> {
    List<AuctionRoom> findByState(AuctionState state);

    List<AuctionRoom> findByAuctionProduct(AuctionProduct auctionProduct);

    List<AuctionRoom> findTop50ByStateOrderByHitDesc(AuctionState state);

    List<AuctionRoom> findTop50ByStateOrderByEndTime(AuctionState state);
}

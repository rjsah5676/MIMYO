package com.ict.serv.repository.auction;


import com.ict.serv.entity.auction.AuctionBid;
import com.ict.serv.entity.auction.AuctionRoom;
import com.ict.serv.entity.auction.BidState;
import com.ict.serv.entity.user.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface AuctionBidRepository extends JpaRepository<AuctionBid, Long> {
    List<AuctionBid> findByRoomOrderByBidTimeAsc(AuctionRoom room);
    void deleteByRoom_RoomId(String roomId);

    int countIdByUser(User user);

    int countIdByUserAndState(User user, BidState state);

    List<AuctionBid> findAllByUserAndStateOrderByIdDesc(User user, BidState state, PageRequest of);

    List<AuctionBid> findAllByUserOrderByIdDesc(User user, PageRequest of);

    List<AuctionBid> findAllByRoomAndState(AuctionRoom room, BidState state);

    List<AuctionBid> findByStateAndUserAndRoom(BidState bidState, User user, AuctionRoom room);

    @Query(value = """
    SELECT COUNT(*)
    FROM auction_bid ab
    JOIN auction_room ar ON ab.room_id = ar.room_id
    JOIN auction_product ap ON ar.auction_product_id = ap.auction_product_id
    WHERE ap.seller_no = :userId
""", nativeQuery = true)
    int countAllBidsBySeller(@Param("userId") Long userId);

    @Query(value = """
    SELECT COUNT(*)
    FROM auction_bid ab
    JOIN auction_room ar ON ab.room_id = ar.room_id
    JOIN auction_product ap ON ar.auction_product_id = ap.auction_product_id
    WHERE ap.seller_no = :userId
      AND ab.state = :state
""", nativeQuery = true)
    int countBidsBySellerAndState(@Param("userId") Long userId, @Param("state") String state);

    @Query(value = """
    SELECT ab.*
    FROM auction_bid ab
    JOIN auction_room ar ON ab.room_id = ar.room_id
    JOIN auction_product ap ON ar.auction_product_id = ap.auction_product_id
    WHERE ap.seller_no = :userId
      AND ab.state = :state
""", nativeQuery = true)
    List<AuctionBid> findSellByUserAndStateOrderByIdDesc(@Param("userId") Long userId, @Param("state") String state, PageRequest of);


    @Query(value = """
    SELECT ab.*
    FROM auction_bid ab
    JOIN auction_room ar ON ab.room_id = ar.room_id
    JOIN auction_product ap ON ar.auction_product_id = ap.auction_product_id
    WHERE ap.seller_no = :userId
""", nativeQuery = true)
    List<AuctionBid> findSellByUserOrderByIdDesc(@Param("userId") Long userId, PageRequest of);
}

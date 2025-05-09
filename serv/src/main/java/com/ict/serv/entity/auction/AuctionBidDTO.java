package com.ict.serv.entity.auction;

import com.ict.serv.dto.UserResponseDto;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AuctionBidDTO {
    private int price;
    UserResponseDto urd;
    private String roomId;
}
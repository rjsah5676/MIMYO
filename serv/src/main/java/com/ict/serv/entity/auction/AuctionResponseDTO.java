package com.ict.serv.entity.auction;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuctionResponseDTO {
    private AuctionProduct product;
    private AuctionRoom room;
}

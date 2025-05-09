package com.ict.serv.entity.auction;


import com.ict.serv.entity.product.OptionDTO;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class AuctionWriteRequest {
    private String productName;
    private String eventCategory;
    private String targetCategory;
    private String productCategory;
    private String detail;
    private int firstPrice;
    private int buyNowPrice;
    private List<OptionDTO> options;
    private int shippingFee;
    private int deposit;
    private LocalDateTime endTime;
}
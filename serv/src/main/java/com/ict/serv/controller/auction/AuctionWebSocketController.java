package com.ict.serv.controller.auction;

import com.ict.serv.dto.UserResponseDto;
import com.ict.serv.entity.auction.AuctionBid;
import com.ict.serv.entity.auction.AuctionBidDTO;
import com.ict.serv.entity.auction.AuctionRoom;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.AuctionService;
import com.ict.serv.service.InteractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.checkerframework.checker.units.qual.A;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Controller
public class AuctionWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AuctionService auctionService;
    private final InteractService interactService;
    @MessageMapping("/auction/{roomId}")
    public void handleBid(@DestinationVariable String roomId, @Payload AuctionBidDTO message) {
        System.out.println(message);
        /*
        User user = interactService.selectUserByName(message.getUserid());
        auctionService.saveBid(roomId, user, message.getPrice());
        UserResponseDto urd = new UserResponseDto(user.getId(),user.getUserid(),user.getUsername(),user.getEmail(),user.getProfileImageUrl(),user.getAuthority(),user.getZipcode(),user.getAddress(), user.getAddressDetail(),user.getGrade(),user.getGradePoint());
        message.setUrd(urd);
        messagingTemplate.convertAndSend("/topic/auction/" + roomId, message);
        */
        User user = interactService.selectUserByName(message.getUrd().getUserid());
        auctionService.saveBid(message.getRoomId(), user, message.getPrice());
        AuctionRoom room = auctionService.getAuctionRoom(message.getRoomId()).get();
        messagingTemplate.convertAndSend("/topic/auction/" + roomId, message);
    }
}
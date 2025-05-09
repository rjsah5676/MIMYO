package com.ict.serv.schdule;

import com.ict.serv.service.AuctionService;
import com.ict.serv.service.ChatService;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.OrderService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Component
public class InitScheduler {
    private final AuctionService auctionService;
    private final InteractService interactService;
    private final OrderService orderService;
    @PostConstruct
    public void init() {
        System.out.println("[PostConstruct] 서버 시작됨! 현재 시간: " + LocalDateTime.now());
//        auctionScheduler();
//        userGradeScheduler();
    }
    /*
    @Scheduled(fixedRate = 3000)
    public void runEvery10Minutes() {
        System.out.println("[Scheduled] 3초마다 실행됨! 현재 시간: " + LocalDateTime.now());
    }*/

    @Scheduled(fixedRate = 30000)
    public void userGradeScheduler() {
        auctionService.closeAllAuctionIfClosed();
        interactService.checkUserPoint();
        orderService.checkOrders();
    }
}

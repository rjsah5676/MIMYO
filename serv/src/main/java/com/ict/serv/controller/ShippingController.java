package com.ict.serv.controller;

import com.ict.serv.entity.auction.AuctionProduct;
import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.order.Shipping;
import com.ict.serv.entity.order.ShippingRequestDTO;
import com.ict.serv.entity.order.ShippingState;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.OrderService;
import com.ict.serv.service.ProductService;
import com.ict.serv.service.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@RequestMapping("/shipping")
public class ShippingController {
    private final ShippingService shippingService;
    private final OrderService orderService;
    private final InteractService interactService;
    private final ProductService productService;
    @PostMapping("/setShipping")
    public String setShipping(@AuthenticationPrincipal UserDetails userDetails, @RequestBody ShippingRequestDTO request) {
        shippingService.startShipping(request);
        User userFrom = interactService.selectUserByName(userDetails.getUsername());
        Orders orders = orderService.selectOrders(request.getOrderId()).get();
        Product product=null;
        AuctionProduct auctionProduct=null;
        if(orders.getProductId()==null)  auctionProduct=orders.getAuctionProduct();
        else product = productService.selectProduct(orders.getProductId()).get();
        User userTo = orders.getUser();
        Message msg = new Message();
        msg.setUserFrom(userFrom);
        if(product!= null) {
            msg.setUserTo(userTo);
            msg.setSubject("구매 하신 물품 '" + product.getProductName() + "'의 배송이 시작되었습니다.");
            msg.setComment("구매 하신 물품 '" + product.getProductName() + "'의 배송이 시작되었습니다.\n<a href='/mypage/purchases'>마이페이지 > 주문 내역</a>에서\n2주 내에 도착 시 배송 완료를 처리해주세요.");
        }
        else {
            msg.setUserTo(userTo);
            msg.setSubject("구매 하신 물품 '" + auctionProduct.getProductName() + "'의 배송이 시작되었습니다.");
            msg.setComment("구매 하신 물품 '" + auctionProduct.getProductName() + "'의 배송이 시작되었습니다.\n<a href='/mypage/purchases'>마이페이지 > 주문 내역</a>에서\n2주 내에 도착 시 배송 완료를 처리해주세요.");

        }
        interactService.sendMessage(msg);
        return "배송 시작!";
    }
    @GetMapping("/finishShipping")
    public String finishShipping(Long orderId) {
        Orders orders = orderService.selectOrders(orderId).get();
        List<Shipping> shippingList = shippingService.selectShippingByOrders(orders);
        for(Shipping shipping: shippingList) {
            shipping.setState(ShippingState.FINISH);
            shipping.setEnd_time(LocalDateTime.now());

            orders.setShippingState(ShippingState.FINISH);
            shippingService.saveOrderAndShipping(shipping,orders);
        }
        return "ok";
    }
}

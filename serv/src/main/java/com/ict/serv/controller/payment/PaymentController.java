package com.ict.serv.controller.payment;

import com.ict.serv.entity.auction.*;
import com.ict.serv.entity.coupon.Coupon;
import com.ict.serv.entity.coupon.CouponState;
import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.order.*;
import com.ict.serv.entity.product.Option;
import com.ict.serv.entity.product.OptionCategory;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.product.ProductState;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.*;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payment")
@CrossOrigin(origins = "*")
public class PaymentController {
    private final OrderService orderService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ProductService productService;
    private final CouponService couponService;
    private final AuctionService auctionService;
    private final InteractService interactService;

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody Map<String, String> requestMap, @AuthenticationPrincipal UserDetails userDetails) {
        User userFrom = interactService.selectUserByName(userDetails.getUsername());
        String secretKey = "test_sk_P9BRQmyarYBwyWl7ykZN8J07KzLN"; // 시크릿 키
        String paymentKey = requestMap.get("paymentKey");
        String orderId = requestMap.get("orderId");
        String iid = requestMap.get("iid");
        //Orders orders = orderService.selectOrders(Long.valueOf(iid)).get();
        OrderGroup orderGroup = orderService.selectOrderGroup(Long.valueOf(iid)).get();
        List<Orders> order_check_list = orderGroup.getOrders();
        List<OrderItem> order_item_check_list= new ArrayList<>();
        for(Orders ord_check:order_check_list) {
            order_item_check_list.addAll(orderService.selectOrderItemList(ord_check));
        }
        for (Orders ods : orderGroup.getOrders()) {
            Product product_check = productService.selectProduct(ods.getProductId()).get();
            for (OrderItem item : order_item_check_list) {
                List<Option> option_list = productService.selectOptions(product_check);
                for (Option option : option_list) {
                    List<OptionCategory> option_category_list = option.getSubOptionCategories();
                    for (OptionCategory opt_cat : option_category_list) {
                        if (Objects.equals(item.getOptionCategoryId(), opt_cat.getId())) {  // 여기 id 비교 수정해야함
                            if (opt_cat.getQuantity() < item.getQuantity()) {
                                for(Orders orders:orderGroup.getOrders()) {
                                    for(OrderItem orderItem: orders.getOrderItems()) orderService.deleteOrderItem(orderItem);
                                    orderService.deleteOrders(orders);
                                }
                                orderService.deleteOrderGroup(orderGroup);
                                Map<String, String> errorBody = new HashMap<>();
                                errorBody.put("error", "quantity_over");
                                return ResponseEntity
                                        .status(HttpStatus.BAD_REQUEST)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(errorBody);
                            }
                        }
                    }
                }
            }
        }

        int amount = Integer.parseInt(requestMap.get("amount"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(secretKey, "");

        Map<String, Object> payload = new HashMap<>();
        payload.put("paymentKey", paymentKey);
        payload.put("orderId", orderId);
        payload.put("amount", amount);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.tosspayments.com/v1/payments/confirm",
                    request,
                    String.class
            );
            if(!orderGroup.getOrders().isEmpty()) {
                Product product = productService.selectProduct(orderGroup.getOrders().get(0).getProductId()).get();
                Message msg = new Message();
                msg.setUserFrom(userFrom);
                msg.setUserTo(product.getSellerNo());
                msg.setSubject("판매중인 물품 '" + product.getProductName() + "'이 판매되었습니다.");
                msg.setComment("판매중인 물품 '" + product.getProductName() + "'이 판매되었습니다.\n<a href='/mypage/sales'>마이페이지 > 판매 내역</a>에서 주문확인 및 배송 등록을 완료해주세요.");
                interactService.sendMessage(msg);
            }

            // 주문 상태는 OrderGroup 단위로 변경
            orderGroup.setState(OrderState.PAID);
            orderGroup.setPaymentKey(paymentKey);
            orderGroup.setOrderIdPg(orderId);
            orderGroup.setPayDone(true);
            orderGroup.setPaidAt(LocalDateTime.now());

            JSONObject json = new JSONObject(response.getBody());
            String method = json.getString("method");
            orderGroup.setPaymentMethod(new String(method.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8));

            // 재고 차감
            List<Orders> ordersList = orderService.selectOrdersByOrderGroup(orderGroup);
            for(Orders orders:ordersList) {
                List<OrderItem> items = orderService.selectOrderItemList(orders);
                Product product = productService.selectProduct(orders.getProductId()).get();
                for (OrderItem item : items) {
                    OptionCategory optionCategory = productService.selectOptionCategory(item.getOptionCategoryId()).get();
                    int quantity = optionCategory.getQuantity() - item.getQuantity();
                    product.setQuantity(product.getQuantity() - item.getQuantity());
                    optionCategory.setQuantity(quantity);
                    productService.saveOptionCategory(optionCategory);
                }
                if(product.getQuantity() <= 0) product.setState(ProductState.SOLDOUT);
                productService.saveProduct(product);
            }
            Long couponId = 0L;
            if(requestMap.get("couponId") != null)
                couponId = Long.valueOf(requestMap.get("couponId"));
            if(couponId!=0) {
                Coupon coupon = couponService.selectCoupon(couponId).get();
                coupon.setState(CouponState.EXPIRED);
                coupon.setUseDate(LocalDateTime.now());
                couponService.saveCoupon(coupon);
            }
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        }

    }

    @PostMapping("/auction/confirm")
    public ResponseEntity<?> auctionConfirmPayment(@RequestBody Map<String, String> requestMap) {
        String secretKey = "test_sk_P9BRQmyarYBwyWl7ykZN8J07KzLN"; // 시크릿 키
        String paymentKey = requestMap.get("paymentKey");
        String orderId = requestMap.get("orderId");
        String iid = requestMap.get("iid");
        OrderGroup orderGroup = orderService.selectOrderGroup(Long.valueOf(iid)).get();
        Orders auctionOrder = orderGroup.getOrders().get(0);
        int amount = Integer.parseInt(requestMap.get("amount"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(secretKey, "");

        Map<String, Object> payload = new HashMap<>();
        payload.put("paymentKey", paymentKey);
        payload.put("orderId", orderId);
        payload.put("amount", amount);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.tosspayments.com/v1/payments/confirm",
                    request,
                    String.class
            );
            orderGroup.setState(OrderState.PAID);
            orderGroup.setPaymentKey(paymentKey);
            orderGroup.setOrderIdPg(orderId);
            orderGroup.setPayDone(true);
            orderGroup.setPaidAt(LocalDateTime.now());

            AuctionProduct auctionProduct = auctionOrder.getAuctionProduct();
            AuctionRoom auctionRoom = auctionService.findAuctionRoomByAuctionProduct(auctionProduct).get(0);
            auctionProduct.setState(ProductState.SOLDOUT);
            auctionRoom.setState(AuctionState.CLOSED);
            auctionService.saveAuctionProduct(auctionProduct);
            auctionService.saveAuctionRoom(auctionRoom);
            List<AuctionBid> bidList = auctionService.findAuctionBidByRoomAndState(auctionRoom, BidState.LIVE);
            for(AuctionBid bid: bidList) {
                bid.setState(BidState.DEAD);
                auctionService.updateBid(bid);
                Message msg = new Message();
                msg.setUserFrom(auctionProduct.getSellerNo());
                msg.setUserTo(bid.getUser());
                msg.setSubject("입찰이 취소처리 되었습니다.");
                msg.setComment("'" + auctionProduct.getProductName()+"' 물품의 입찰이 취소되었습니다. \n보증금은 1일 내 환불처리 됩니다.");
                interactService.sendMessage(msg);
            }
            List<AuctionBid> buyerList = auctionService.findAuctionBidByRoomAndState(auctionRoom,BidState.SUCCESS);
            if(!buyerList.isEmpty()) {
                AuctionBid bbb = buyerList.get(0);
                bbb.setState(BidState.PAID);
                auctionService.updateBid(bbb);
            }
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        }

    }
}

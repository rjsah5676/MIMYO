package com.ict.serv.controller;

import com.ict.serv.controller.admin.PagingVO;
import com.ict.serv.dto.OrderRequest;
import com.ict.serv.dto.OrderRequestDto;
import com.ict.serv.entity.auction.AuctionProduct;
import com.ict.serv.entity.auction.AuctionRoom;
import com.ict.serv.entity.auction.AuctionState;
import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.order.*;
import com.ict.serv.entity.product.Option;
import com.ict.serv.entity.product.OptionCategory;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.Address;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.AuctionService;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.OrderService;
import com.ict.serv.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.checkerframework.checker.units.qual.A;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@RequestMapping("/order")
public class OrderController {
    private final InteractService interactService;
    private final OrderService orderService;
    private final ProductService productService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final AuctionService auctionService;

    @GetMapping("/cancel")
    public void cancelOrder(@RequestParam Long orderGroupId) {
        OrderGroup orderGroup = orderService.selectOrderGroup(orderGroupId)
                .orElseThrow(() -> new RuntimeException("주문 그룹이 존재하지 않습니다."));

        for(Orders orders:orderGroup.getOrders()) {
            for(OrderItem orderItem: orders.getOrderItems()) orderService.deleteOrderItem(orderItem);
            orderService.deleteOrders(orders);
        }
        orderService.deleteOrderGroup(orderGroup);
    }

    @GetMapping("/cancelOrder")
    public String realCancelOrder(Long orderId, String msgg, @AuthenticationPrincipal UserDetails userDetails) {
        User userFrom = interactService.selectUserByName(userDetails.getUsername());
        Orders order = orderService.selectOrders(orderId).get();
        if(order.getShippingState() == ShippingState.BEFORE) {
            return "err4";
        }
        OrderGroup orderGroup = order.getOrderGroup();
        int cancelAmount = 0;

        for(OrderItem orderItem:order.getOrderItems()) {
            double itemPrice = orderItem.getPrice();
            double discountPrice = itemPrice - (itemPrice * orderItem.getDiscountRate()) / 100;
            cancelAmount += ((int) discountPrice + orderItem.getAdditionalFee()) * orderItem.getQuantity();
        }
        boolean isAuction=false;
        if(order.getOrderItems().isEmpty()) isAuction=true;
        if(isAuction)  {
            cancelAmount = orderGroup.getTotalPrice();
        }
        cancelAmount += order.getShippingFee();
        if(orderGroup.getCouponDiscount() > 0) {
            cancelAmount-= orderGroup.getCouponDiscount();
            orderGroup.setCouponDiscount(-orderGroup.getCouponDiscount());
        }
        String secretKey = "test_sk_P9BRQmyarYBwyWl7ykZN8J07KzLN"; // 테스트 키
        String paymentKey = orderGroup.getPaymentKey();

        String cancelUrl = "https://api.tosspayments.com/v1/payments/" + paymentKey + "/cancel";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(secretKey, "");

        Map<String, Object> payload = new HashMap<>();
        if (msgg == null) {
            payload.put("cancelReason", "고객 요청으로 인한 주문 취소");
        }
        else {
            payload.put("cancelReason", "판매자 요청으로 인한 주문 취소");
        }
        payload.put("cancelAmount", cancelAmount);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(cancelUrl, request, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                orderGroup.setCancelAmount(orderGroup.getCancelAmount() + cancelAmount);
                ShippingState ss = null;
                if(msgg == null) ss = ShippingState.CANCELED;
                else ss=ShippingState.SELLERCANCELED;
                order.setShippingState(ss);
                orderService.insertOrder(order);

                boolean isAllCancelled = true;
                for (Orders od : orderGroup.getOrders()) {
                    if (od.getShippingState() != ShippingState.CANCELED && od.getShippingState() != ShippingState.SELLERCANCELED) {
                        isAllCancelled = false;
                        break;
                    }
                }
                orderGroup.setState(isAllCancelled ? OrderState.CANCELED : OrderState.PARTCANCELED);
                orderService.saveOrderGroup(orderGroup);
                Product product = null;
                AuctionProduct auctionProduct = null;
                if(!isAuction)
                    product = productService.selectProduct(orderGroup.getOrders().get(0).getProductId()).get();
                else
                    auctionProduct = orderGroup.getOrders().get(0).getAuctionProduct();
                if(msgg==null){
                    Message msg = new Message();
                    msg.setUserFrom(userFrom);
                    if(!isAuction) {
                        msg.setUserTo(product.getSellerNo());
                        msg.setSubject("판매중인 물품 '" + product.getProductName() + "'이 주문 취소되었습니다.");
                        msg.setComment("판매중인 물품 '" + product.getProductName() + "'이 주문 취소되었습니다.\n<a href='/mypage/sales'>마이페이지 > 판매 내역</a>에서 확인 가능합니다.");
                    } else {
                        msg.setUserTo(auctionProduct.getSellerNo());
                        msg.setSubject("판매중인 물품 '" + auctionProduct.getProductName() + "'이 주문 취소되었습니다.");
                        msg.setComment("판매중인 물품 '" + auctionProduct.getProductName() + "'이 주문 취소되었습니다.\n<a href='/mypage/sales'>마이페이지 > 판매 내역</a>에서 확인 가능합니다.");

                    }
                    interactService.sendMessage(msg);
                }else{
                    Message msg = new Message();
                    msg.setUserFrom(userFrom);
                    msg.setUserTo(order.getUser());
                    if(!isAuction) {
                        msg.setSubject("구매하신 물품 '" + product.getProductName() + "'이 주문 취소되었습니다.");
                        msg.setComment("구매하신 물품 '" + product.getProductName() + "'이 주문 취소되었습니다.\n<a href='/mypage/purchases'>마이페이지 > 구매 내역</a>에서 확인 가능합니다.");
                    } else {
                        msg.setSubject("구매하신 물품 '" + auctionProduct.getProductName() + "'이 주문 취소되었습니다.");
                        msg.setComment("구매하신 물품 '" + auctionProduct.getProductName() + "'이 주문 취소되었습니다.\n<a href='/mypage/purchases'>마이페이지 > 구매 내역</a>에서 확인 가능합니다.");
                    }
                    interactService.sendMessage(msg);
                }
                return "ok";
            } else {
                return "err2";
            }
        } catch (Exception e) {
            return "err";
        }
    }


    @GetMapping("auctionCancel")
    public void auctionCancel(@RequestParam Long orderId) {
        AuctionOrder auctionOrder = orderService.selectAuctionOrder(orderId).orElseThrow(() -> new RuntimeException("주문이 없습니다."));
        auctionOrder.setState(OrderState.CANCELED);
        orderService.saveAuctionOrder(auctionOrder);
    }

    @PostMapping("/setAuctionOrder")
    public OrderGroup setAuctionOrder(@AuthenticationPrincipal UserDetails userDetails, @RequestBody AuctionOrderRequest request) {
        // 사용자 정보 가져오기
        User user = interactService.selectUserByName(userDetails.getUsername());
        Address address = new Address();
        address.setId(Long.valueOf(request.getAddrId()));

        AuctionRoom auctionRoom = auctionService.getAuctionRoom(auctionService.getAuctionRoomByProduct(auctionService.getAuctionProduct(request.getProductId()))).get();
        if (auctionRoom.getState() == AuctionState.CLOSED && !Objects.equals(auctionRoom.getHighestBidderId(), user.getId())) return null;
        // OrderGroup 객체 생성
        OrderGroup orderGroup = new OrderGroup();
        orderGroup.setUser(user);
        orderGroup.setState(OrderState.BEFORE);
        orderGroup.setTotalPrice(request.getTotalPrice()-request.getShippingFee());
        orderGroup.setTotalShippingFee(request.getShippingFee());
        orderGroup.setCouponDiscount(0);

        Orders order = new Orders();
        order.setUser(user);
        order.setRequest(request.getReq());
        order.setAddress(address);
        order.setOrderNum(request.getOrderId());
        order.setShippingFee(request.getShippingFee());
        order.setAuctionProduct(auctionService.getAuctionProduct(request.getProductId()).get());
        order.setOrderGroup(orderGroup);  // 저장된 OrderGroup을 연결
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String now = LocalDateTime.now().format(formatter);
        order.setStartDate(now);
        order.setShippingState(ShippingState.PAID);
        // 주문 리스트 생성 (필요시)
        orderGroup.getOrders().add(order);

        return orderService.saveOrderGroup(orderGroup);  // 혹은 필요한 데이터 반환
    }

    @PostMapping("/setOrder")
    public OrderGroup setOrder(@AuthenticationPrincipal UserDetails userDetails, @RequestBody OrderRequest or) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        Address address = new Address();
        address.setId(Long.valueOf(or.getAddrId()));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String now = LocalDateTime.now().format(formatter);

        OrderGroup orderGroup = new OrderGroup();
        orderGroup.setUser(user);
        orderGroup.setState(OrderState.BEFORE);
        orderGroup.setTotalPrice(0);
        orderGroup.setTotalShippingFee(0);
        orderGroup.setOrders(new ArrayList<>());
        orderGroup.setCouponDiscount(or.getCouponDiscount());
        Map<Long, List<OrderRequestDto>> groupedByProduct = new HashMap<>();

        for (OrderRequestDto ord : or.getOptions()) {
            Long productId = productService.selectOptionCategory(ord.getOptionCategoryId())
                    .orElseThrow()
                    .getOption()
                    .getProduct()
                    .getId();
            groupedByProduct.computeIfAbsent(productId, k -> new ArrayList<>()).add(ord);
        }

        int index = 1;
        int totalPrice = 0;
        int totalShipping = 0;

        for (Map.Entry<Long, List<OrderRequestDto>> entry : groupedByProduct.entrySet()) {
            Long productId = entry.getKey();
            List<OrderRequestDto> orderDtos = entry.getValue();

            Orders order = new Orders();
            order.setUser(user);
            order.setRequest(or.getReq());
            order.setAddress(address);
            order.setOrderNum(or.getOrderId() + "-" + index++);
            order.setShippingFee(orderDtos.stream().mapToInt(OrderRequestDto::getShippingFee).sum());
            order.setProductId(productId);
            order.setOrderGroup(orderGroup);
            order.setStartDate(now);
            order.setOrderItems(new ArrayList<>());
            order.setShippingState(ShippingState.PAID);
            int orderTotal = 0;

            for (OrderRequestDto ord : orderDtos) {
                OptionCategory optCat = productService.selectOptionCategory(ord.getOptionCategoryId()).orElseThrow();
                Option opt = optCat.getOption();
                Product prod = opt.getProduct();

                int originPrice = prod.getPrice();
                int discountRate = prod.getDiscountRate();
                int discountedPrice = (int) Math.round(originPrice * (1 - discountRate / 100.0));
                int additional = optCat.getAdditionalPrice();
                int quantity = ord.getQuantity();
                int itemTotal = (discountedPrice + additional) * quantity;

                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setQuantity(quantity);
                item.setPrice(originPrice);
                item.setDiscountRate(discountRate);
                item.setRefundState(RefundState.NONE);
                item.setOptionCategoryId(ord.getOptionCategoryId());
                item.setProductName(prod.getProductName());
                item.setOptionName(opt.getOptionName());
                item.setOptionCategoryName(optCat.getCategoryName());
                item.setAdditionalFee(additional);
                order.getOrderItems().add(item);
                orderTotal += itemTotal;
            }

            totalPrice += orderTotal;
            totalShipping += order.getShippingFee();
            orderGroup.getOrders().add(order);
        }

        orderGroup.setTotalPrice(totalPrice);
        orderGroup.setTotalShippingFee(totalShipping);
        orderGroup.setTotalPrice(totalPrice);
        orderGroup.setTotalShippingFee(totalShipping);

        return orderService.saveOrderGroup(orderGroup);
    }

    @GetMapping("/orderConfirm")
    public String orderConfirm(Long orderId, ShippingState state) {
        Orders orders = orderService.selectOrders(orderId).get();
        if(orders.getShippingState() == ShippingState.CANCELED) {
            return "err1";
        }
        orders.setShippingState(state);
        orderService.insertOrder(orders);
        return "ok";
    }

    @GetMapping("/orderList")
    public Map orderList(@AuthenticationPrincipal UserDetails userDetails, OrderPagingVO pvo) {
        pvo.setOnePageRecord(5);
        User user = interactService.selectUserByName(userDetails.getUsername());
        pvo.setTotalRecord(orderService.totalOrderCount(user, pvo));
        List<OrderGroup> og = orderService.getOrderByUser(user, pvo);
        List<OrderGroupDTO> ogdto = new ArrayList<>();
        for(OrderGroup group: og) {
            OrderGroupDTO ogd = new OrderGroupDTO();
            ogd.setOrderDate(group.getOrderDate());
            ogd.setState(group.getState());
            ogd.setTotalPrice(group.getTotalPrice());
            ogd.setTotalShippingFee(group.getTotalShippingFee());
            ogd.setCouponDiscount(group.getCouponDiscount());
            ogd.setId(group.getId());
            ogd.setUser(group.getUser());
            ogd.setCancelAmount(group.getCancelAmount());
            ogd.setDeposit(0);
            List<OrdersDTO> ordersDTO = new ArrayList<>();
            for(Orders order : group.getOrders()) {
                OrdersDTO odd = new OrdersDTO();
                odd.setDeposit(0);
                if(order.getProductId() == null){
                    int deposit=auctionService.getAuctionDeposit(order.getAuctionProduct());
                    ogd.setDeposit(deposit);
                    odd.setAuctionProduct(order.getAuctionProduct());
                    odd.setFilename(order.getAuctionProduct().getImages().get(0).getFilename());
                    odd.setDeposit(deposit);
                }
                else {
                    odd.setFilename(productService.selectProduct(order.getProductId()).get().getImages().get(0).getFilename());
                    odd.setProductId(order.getProductId());
                }
                odd.setOrderItems(order.getOrderItems());
                odd.setAddress(order.getAddress());
                odd.setOrderNum(order.getOrderNum());
                odd.setOrderGroup(order.getOrderGroup());
                odd.setRequest(order.getRequest());
                odd.setModifiedDate(order.getModifiedDate());
                odd.setShippingState(order.getShippingState());
                odd.setId(order.getId());
                odd.setUser(order.getUser());
                odd.setStartDate(order.getStartDate());
                odd.setShippingFee(order.getShippingFee());
                ordersDTO.add(odd);
            }
            ogd.setOrders(ordersDTO);
            ogdto.add(ogd);
        }
        Map map = new HashMap();
        map.put("pvo", pvo);
        map.put("orderList", ogdto);

        return map;
    }

    @GetMapping("/sellList")
    public Map sellList(@AuthenticationPrincipal UserDetails userDetails, ShippingState shippingState) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        List<Product> products = productService.selectProductByUser(user);
        List<AuctionProduct> auctionProducts = auctionService.selecteAuctionProductByUser(user);
        List<String> filenameList = new ArrayList<>();
        List<Orders> orders = new ArrayList<>();
        if (shippingState == null) {
            for (Product product : products) {
                List<Orders> order = orderService.getOrderByProduct(product.getId());
                for (Orders mini : order) {
                    orders.add(mini);
                    if (product.getImages().isEmpty()) filenameList.add("");
                    else filenameList.add(product.getImages().get(0).getFilename());
                }
            }
            for (AuctionProduct auctionProduct : auctionProducts) {
                List<Orders> order = orderService.getOrderByAuctionProduct(auctionProduct);
                for (Orders mini : order) {
                    orders.add(mini);
                    auctionProduct.setDiscountRate(mini.getOrderGroup().getTotalPrice());
                    if (auctionProduct.getImages().isEmpty()) filenameList.add("");
                    else filenameList.add(auctionProduct.getImages().get(0).getFilename());
                }
            }
        } else{
            for (Product product : products) {
                List<Orders> order = orderService.getOrderByProductAndState(product.getId(), shippingState);
                for (Orders mini : order) {
                    orders.add(mini);
                    if (product.getImages().isEmpty()) filenameList.add("");
                    else filenameList.add(product.getImages().get(0).getFilename());
                }
            }
            for (AuctionProduct auctionProduct : auctionProducts) {
                List<Orders> order = orderService.getOrderByAuctionProductAndState(auctionProduct, shippingState);
                for (Orders mini : order) {
                    orders.add(mini);
                    auctionProduct.setDiscountRate(mini.getOrderGroup().getTotalPrice());
                    if (auctionProduct.getImages().isEmpty()) filenameList.add("");
                    else filenameList.add(auctionProduct.getImages().get(0).getFilename());
                }
            }
        }
        List<Pair<Orders, String>> combinedList = new ArrayList<>();
        for (int i = 0; i < orders.size(); i++) {
            combinedList.add(new Pair<>(orders.get(i), filenameList.get(i)));
        }

        combinedList.sort((a, b) -> b.getKey().getId().compareTo(a.getKey().getId())); // id 내림차순

        orders = new ArrayList<>();
        filenameList = new ArrayList<>();
        for (Pair<Orders, String> pair : combinedList) {
            orders.add(pair.getKey());
            filenameList.add(pair.getValue());
        }

        Map map = new HashMap();
        map.put("orderList", orders);
        map.put("filenameList", filenameList);
        return map;
    }

    @GetMapping("/refundOrder")
    public String refundOrder(Long orderId, @AuthenticationPrincipal UserDetails userDetails) {
        User userFrom = interactService.selectUserByName(userDetails.getUsername());
        Orders order = orderService.selectOrders(orderId).get();
        OrderGroup orderGroup = order.getOrderGroup();
        int refundAmount = 0;

        boolean isAuction = order.getOrderItems().isEmpty();
        if (isAuction) {
            refundAmount = orderGroup.getTotalPrice();
        } else {
            for (OrderItem orderItem : order.getOrderItems()) {
                double itemPrice = orderItem.getPrice();
                double discountPrice = itemPrice - (itemPrice * orderItem.getDiscountRate()) / 100;
                refundAmount += ((int) discountPrice + orderItem.getAdditionalFee()) * orderItem.getQuantity();
            }
        }

        refundAmount += order.getShippingFee();
        if (orderGroup.getCouponDiscount() > 0) {
            refundAmount -= orderGroup.getCouponDiscount();
            orderGroup.setCouponDiscount(-orderGroup.getCouponDiscount());
        }

        String secretKey = "test_sk_P9BRQmyarYBwyWl7ykZN8J07KzLN"; // 테스트 키
        String paymentKey = orderGroup.getPaymentKey(); // 결제 키

        String cancelUrl = "https://api.tosspayments.com/v1/payments/" + paymentKey + "/cancel";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(secretKey, "");

        Map<String, Object> payload = new HashMap<>();
        payload.put("cancelReason", "고객 요청 환불");
        payload.put("cancelAmount", refundAmount);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(cancelUrl, request, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                orderGroup.setCancelAmount(orderGroup.getCancelAmount() + refundAmount);
                orderGroup.setIsCancelled(true);
                orderGroup.setState(OrderState.RETURNED);
                order.setShippingState(ShippingState.RETURNED);
                orderService.insertOrder(order);
                OrderGroup og2 = orderService.saveOrderGroup(orderGroup);

                boolean isAllReturned = true;
                for (Orders od : og2.getOrders()) {
                    if (od.getShippingState() != ShippingState.RETURNED) {
                        isAllReturned = false;
                        break;
                    }
                }
                if (!isAllReturned) {
                    og2.setState(OrderState.PARTRETURNED);
                    orderService.saveOrderGroup(og2);
                }

                Message msg = new Message();
                msg.setUserFrom(userFrom);

                if (!isAuction) {
                    Product product = productService.selectProduct(orderGroup.getOrders().get(0).getProductId()).get();
                    msg.setUserTo(product.getSellerNo());
                    msg.setSubject("판매중인 물품 '" + product.getProductName() + "'이 환불되었습니다.");
                    msg.setComment("판매중인 물품 '" + product.getProductName() + "'이 환불되었습니다.\n<a href='/mypage/sales'>마이페이지 > 판매 내역</a>에서 확인 가능합니다.");
                } else {
                    AuctionProduct auctionProduct = orderGroup.getOrders().get(0).getAuctionProduct();
                    msg.setUserTo(auctionProduct.getSellerNo());
                    msg.setSubject("판매중인 물품 '" + auctionProduct.getProductName() + "'이 환불되었습니다.");
                    msg.setComment("판매중인 물품 '" + auctionProduct.getProductName() + "'이 환불되었습니다.\n<a href='/mypage/sales'>마이페이지 > 판매 내역</a>에서 확인 가능합니다.");
                }

                interactService.sendMessage(msg);
                return "ok";
            } else {
                return "err2";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "err";
        }
    }

}

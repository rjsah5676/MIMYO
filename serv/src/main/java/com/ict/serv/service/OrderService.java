package com.ict.serv.service;

import com.ict.serv.entity.auction.AuctionProduct;
import com.ict.serv.entity.order.*;
import com.ict.serv.entity.product.HotCategoryDTO;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.sales.CategorySalesDTO;
import com.ict.serv.entity.sales.DailySalesDTO;
import com.ict.serv.entity.sales.SalesStatsDTO;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.order.*;
import com.ict.serv.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository order_repo;
    private final OrderItemRepository order_item_repo;
    private final OrderGroupRepository order_group_repo;
    private final AuctionOrderRepository auctionOrderRepository;
    private final OrderRepository orderRepository;
    private final ShippingRepository shippingRepository;
    private final ProductRepository productRepository;

    public Orders insertOrder(Orders orders) {
        return order_repo.save(orders);
    }

    public OrderItem insertOrderItem(OrderItem orderItem) {
        return order_item_repo.save(orderItem);
    }

    public Optional<Orders> selectOrders(Long id) {
        return order_repo.findById(id);
    }

    public List<OrderItem> selectOrderItemList(Orders orders) {
        return order_item_repo.findAllByOrder(orders);
    }

    public Optional<OrderItem> selectOrderItem(Long id) {
        return order_item_repo.findById(id);
    }

    public List<Orders> selectCheckPurchase(User user, Long productId) {
        return order_repo.findByUserAndProductId(user, productId);
    }

    public OrderGroup saveOrderGroup(OrderGroup orderGroup) {
        return order_group_repo.save(orderGroup);
    }

    public Optional<OrderGroup> selectOrderGroup(Long id) {
        return order_group_repo.findById(id);
    }

    public List<Orders> selectOrdersByOrderGroup(OrderGroup orderGroup) {
        return order_repo.findAllByOrderGroup(orderGroup);
    }

    public int totalOrderCount(User user, OrderPagingVO pvo) {
        if(pvo.getState() == null) return order_group_repo.countIdByUser(user);
        return order_group_repo.countIdByUserAndState(user, pvo.getState());
    }

    public List<OrderGroup> getOrderByUser(User user, OrderPagingVO pvo) {
        if(pvo.getState() == null) return order_group_repo.findAllByUserOrderByOrderDateDesc(user,PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
        return order_group_repo.findAllByUserAndStateOrderByOrderDateDesc(user,pvo.getState(),PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
    }

    public List<Orders> getOrderByProduct(Long id) {
        return order_repo.findAllByProductIdAndShippingStateNotOrderByIdDesc(id, ShippingState.SETTLED);
    }
    public List<Orders> getOrderByProductAndState(Long id, ShippingState state) {
        return order_repo.findAllByProductIdAndShippingStateOrderByIdDesc(id,state);
    }
    public List<HotCategoryDTO> getHotCategory() {
        List<Object[]> result = order_repo.countProductCategoryFromPaidOrdersWithinTwoWeeks();

        List<HotCategoryDTO> hotCategoryList = new ArrayList<>();
        for (Object[] row : result) {
            String productCategory = (String) row[0];
            Long count = (Long) row[1];

            HotCategoryDTO dto = new HotCategoryDTO();
            dto.setProductCategory(productCategory);
            dto.setCount(count);

            hotCategoryList.add(dto);
        }

        return hotCategoryList;
    }

    public AuctionOrder saveAuctionOrder(AuctionOrder auctionOrder) { return auctionOrderRepository.save(auctionOrder); }
    public Optional<AuctionOrder> selectAuctionOrder(Long id) { return auctionOrderRepository.findById(id);}

    public List<OrderGroup> selectAllOrderGroup() {
        return order_group_repo.findAllByState(OrderState.PAID);
    }
    public List<SalesStatsDTO> getDailySalesStats() {
        List<OrderState> targetOrderGroupStates = Arrays.asList(OrderState.PAID, OrderState.PARTRETURNED,OrderState.PARTCANCELED);

        List<OrderGroup> orderGroups = order_group_repo.findAllByStateIn(targetOrderGroupStates);
        List<AuctionOrder> auctionOrders = auctionOrderRepository.findAllByState(OrderState.PAID); //

        Map<String, SalesStatsDTO> statsMap = new HashMap<>();
        for (OrderGroup group : orderGroups) {
            String date = group.getOrderDate().substring(0, 10);

            statsMap.compute(date, (key, existing) -> {
                if (existing == null) {
                    return new SalesStatsDTO(
                            date,
                            1,
                            group.getTotalPrice(),
                            group.getTotalShippingFee(),
                            group.getCouponDiscount(),
                            group.getCancelAmount(),
                            group.getTotalPrice() + group.getTotalShippingFee()
                                    - group.getCouponDiscount() - group.getCancelAmount()
                    );
                } else {
                    existing.setOrders(existing.getOrders() + 1);
                    existing.setTotalPrice(existing.getTotalPrice() + group.getTotalPrice());
                    existing.setShippingCost(existing.getShippingCost() + group.getTotalShippingFee());
                    existing.setCouponDiscount(existing.getCouponDiscount() + group.getCouponDiscount());
                    existing.setCancelAmount(existing.getCancelAmount() + group.getCancelAmount());
                    existing.setTotalSales(existing.getTotalPrice() + existing.getShippingCost()
                            - existing.getCouponDiscount() - existing.getCancelAmount());
                    return existing;
                }
            });
        }

        for (AuctionOrder order : auctionOrders) {
            String date = order.getOrderDate().substring(0, 10);

            statsMap.compute(date, (key, existing) -> {
                if (existing == null) {
                    return new SalesStatsDTO(
                            date,
                            1,
                            order.getTotalPrice(),
                            order.getTotalShippingFee(),
                            0,
                            0,
                            order.getTotalPrice() + order.getTotalShippingFee()
                    );
                } else {
                    existing.setOrders(existing.getOrders() + 1);
                    existing.setTotalPrice(existing.getTotalPrice() + order.getTotalPrice());
                    existing.setShippingCost(existing.getShippingCost() + order.getTotalShippingFee());
                    // 쿠폰 없음이므로 변화 없음
                    existing.setTotalSales(existing.getTotalPrice() + existing.getShippingCost() - existing.getCouponDiscount());
                    return existing;
                }
            });
        }

        return new ArrayList<>(statsMap.values()).stream()
                .sorted(Comparator.comparing(SalesStatsDTO::getDate))
                .collect(Collectors.toList());
    }
    public List<CategorySalesDTO> getSalesByCategory() {
        // Step 1: 수량 기반 집계는 그대로 사용
        List<Object[]> raw = orderRepository.getSalesDataByCategory();
        Map<String, CategorySalesDTO> categoryMap = raw.stream().collect(Collectors.toMap(
                row -> (String) row[0],
                row -> new CategorySalesDTO(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        0L // totalRevenue는 아래에서 채움
                )
        ));

        // Step 2: 환불 반영된 매출을 카테고리별로 집계
        List<OrderGroup> paidGroups = order_group_repo.findAllByStateIn(
                List.of(OrderState.PAID, OrderState.PARTRETURNED)
        );

        for (OrderGroup group : paidGroups) {
            int validPrice = group.getTotalPrice() - group.getCancelAmount();

            // 이 그룹의 상품이 어떤 카테고리인지 추출
            List<Orders> orders = group.getOrders();
            if (orders.isEmpty()) continue;

            String category = "";
            // 하나의 카테고리만 존재한다고 가정
            if(orders.get(0).getProduct() == null) {
                category = orders.get(0).getAuctionProduct().getProductCategory();
            }
            else category = orders.get(0).getProduct().getProductCategory();

            // 해당 카테고리에 validPrice를 더함
            categoryMap.computeIfPresent(category, (k, dto) -> {
                dto.setTotalRevenue(dto.getTotalRevenue() + validPrice);
                return dto;
            });
        }

        return new ArrayList<>(categoryMap.values());
    }
    public List<CategorySalesDTO> getSalesByEventCategory() {
        return toDTO(orderRepository.getSalesByEventCategory());
    }

    public List<CategorySalesDTO> getSalesByTargetCategory() {
        return toDTO(orderRepository.getSalesByTargetCategory());
    }

    private List<CategorySalesDTO> toDTO(List<Object[]> raw) {
        return raw.stream()
                .map(row -> new CategorySalesDTO(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        ((Number) row[2]).longValue()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteOrderItem(OrderItem orderItem) {
        order_item_repo.delete(orderItem);
    }
    @Transactional
    public void deleteOrders(Orders orders) {
        List<Shipping> shippingList = shippingRepository.findAllByOrders(orders);
        for(Shipping shipping: shippingList) shippingRepository.delete(shipping);
        order_repo.delete(orders);
    }
    @Transactional
    public void deleteOrderGroup(OrderGroup orderGroup) {
        order_group_repo.delete(orderGroup);
    }

    public List<Orders> getOrderByAuctionProduct(AuctionProduct auctionProduct) {
        return order_repo.findAllByAuctionProductAndShippingStateNotOrderByIdDesc(auctionProduct, ShippingState.SETTLED);
    }

    public List<Orders> getOrderByAuctionProductAndState(AuctionProduct auctionProduct, ShippingState shippingState) {
        return order_repo.findAllByAuctionProductAndShippingStateOrderByIdDesc(auctionProduct, shippingState);
    }

    public int getOrderCountBySeller(User user) {
        List<Product> productList = productRepository.findAllBySellerNo(user);
        List<Orders> ordersList = new ArrayList<>();
        List<ShippingState> states = Arrays.asList(ShippingState.FINISH, ShippingState.SETTLED);
        for(Product product:productList){
            List<Orders> inputOrderList = order_repo.findAllByProductIdAndShippingStateInOrderByIdDesc(product.getId(), states);
            ordersList.addAll(inputOrderList);
        }
        return ordersList.size();
    }

    public void checkOrders() {
        List<Orders> ordersList = order_repo.findByShippingState(ShippingState.ONGOING);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        LocalDateTime now = LocalDateTime.now();

        for (Orders order : ordersList) {
            if (order.getStartDate() == null) continue;

            LocalDateTime orderStartDate;
            try {
                orderStartDate = LocalDateTime.parse(order.getStartDate(), formatter).plusHours(9);
            } catch (Exception e) {
                System.out.println("날짜 파싱 실패: " + order.getStartDate());
                continue;
            }

            long secondsBetween = ChronoUnit.SECONDS.between(orderStartDate, now);
            if (secondsBetween >= 300) { //5분마다 체크 후 구매확정 >>> 테스트용이라서 실제는 2주
                order.setShippingState(ShippingState.FINISH);
                order_repo.save(order);
            }
        }
    }
}

package com.ict.serv.service;

import com.ict.serv.entity.UserPoint;
import com.ict.serv.entity.auction.AuctionProduct;
import com.ict.serv.entity.order.AuctionOrder;
import com.ict.serv.entity.order.OrderItem;
import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.order.ShippingState;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.review.ReviewStatsDTO;
import com.ict.serv.entity.sales.*;
import com.ict.serv.repository.*;
import com.ict.serv.repository.inquiry.InquiryRepository;
import com.ict.serv.repository.log.SearchLogRepository;
import com.ict.serv.repository.log.UserJoinLogRepository;
import com.ict.serv.repository.order.AuctionOrderRepository;
import com.ict.serv.repository.order.OrderItemRepository;
import com.ict.serv.repository.order.OrderRepository;
import com.ict.serv.repository.product.ProductRepository;
import com.ict.serv.repository.review.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MyStatsService {
    private final ReviewRepository reviewRepository;
    private final InquiryRepository inquiryRepository;
    private final WishRepository wishRepository;
    private final UserPointRepository userPointRepository;
    private final SearchLogRepository searchLogRepository;
    private final FollowRepository followRepository;
    private final UserJoinLogRepository userJoinLogRepository;
    private final MyStatsRepository myStatsRepository;
    private final CouponRepository couponRepository;
    private final OrderItemRepository orderItemRepository;
    private final AuctionOrderRepository auctionOrderRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public Long getReviewCount(Long userId, int year, Integer month) {
        return reviewRepository.countByUserIdAndDate(userId, year, month);
    }

    public Long getInquiryCount(Long userId, int year, Integer month) {
        return inquiryRepository.countByUserIdAndDate(userId, year, month);
    }

    public Long getWishlistCount(Long userId, int year, Integer month) {
        return wishRepository.countByUserIdAndDate(userId, year, month);
    }

    public List<UserPoint> getUserPointHistory(Long userId, int year, Integer month) {
        return userPointRepository.findAllByUserIdAndDate(userId, year, month);
    }

    public List<Object[]> getTopSearchWords(Long userId, int year, Integer month) {
        return searchLogRepository.findTopKeywordsByUserIdAndDate(userId, year, month, PageRequest.of(0, 5));
    }

    public Map<String, Long> getCategorySearchRate(Long userId, int year, Integer month) {
        Map<String, Long> result = new HashMap<>();
        List<Object[]> rawResult = searchLogRepository.findCategorySearchCountsByUserIdAndDate(userId, year, month);
        for (Object[] row : rawResult) {
            String category = (String) row[0];
            Long count = (Long) row[1];
            result.put(category, count);
        }
        return result;
    }

    public Long getFollowerCount(Long userId, int year, Integer month) {
        return followRepository.countFollowersByUserIdAndDate(userId, year, month);
    }

    public Long getFollowingCount(Long userId, int year, Integer month) {
        return followRepository.countFollowingByUserIdAndDate(userId, year, month);
    }

    public Long getMonthlyAccessCount(Long userId, int year, Integer month) {
        return userJoinLogRepository.countUserAccessByYearAndMonth(userId, year, month);
    }

    public List<PurchaseStatsDTO> getMonthlyPurchaseStats(Long userId, int year, Integer month) {
        Map<YearMonth, PurchaseStatsDTO> statsMap = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // 1. 일반 주문 처리
        List<Orders> ordersList = myStatsRepository.findByUserIdAndShippingStateIn(userId, List.of(ShippingState.SETTLED, ShippingState.FINISH));
        for (Orders order : ordersList) {
            LocalDateTime dateTime = LocalDateTime.parse(order.getStartDate(), formatter);
            if (dateTime.getYear() != year) continue;
            if (month != null && dateTime.getMonthValue() != month) continue;

            YearMonth yearMonth = YearMonth.from(dateTime);
            PurchaseStatsDTO statsDTO = statsMap.computeIfAbsent(yearMonth, ym -> new PurchaseStatsDTO(ym.getYear(), ym.getMonthValue(), 0, BigDecimal.ZERO));
            statsDTO.setOrderCount(statsDTO.getOrderCount() + 1);

            BigDecimal orderTotal = BigDecimal.ZERO;
            for (OrderItem item : order.getOrderItems()) {
                BigDecimal priceAfterDiscount = BigDecimal.valueOf(item.getPrice())
                        .multiply(BigDecimal.valueOf(100 - item.getDiscountRate()))
                        .divide(BigDecimal.valueOf(100));
                BigDecimal totalItemPrice = priceAfterDiscount
                        .add(BigDecimal.valueOf(item.getAdditionalFee()))
                        .multiply(BigDecimal.valueOf(item.getQuantity()));
                orderTotal = orderTotal.add(totalItemPrice);
            }
            statsDTO.setTotalAmount(statsDTO.getTotalAmount().add(orderTotal));
        }

        // 2. 경매 주문 처리
        List<Orders> auctionOrders = orderRepository.findSettledAuctionOrdersByUser(userId);
        for (Orders order : auctionOrders) {
            LocalDateTime dateTime = LocalDateTime.parse(order.getStartDate(), formatter);
            if (dateTime.getYear() != year) continue;
            if (month != null && dateTime.getMonthValue() != month) continue;

            YearMonth yearMonth = YearMonth.from(dateTime);
            PurchaseStatsDTO statsDTO = statsMap.computeIfAbsent(yearMonth,
                    ym -> new PurchaseStatsDTO(ym.getYear(), ym.getMonthValue(), 0, BigDecimal.ZERO));
            statsDTO.setOrderCount(statsDTO.getOrderCount() + 1);

            Optional<AuctionOrder> auctionOrderOpt = auctionOrderRepository.findByAuctionProductId(
                    order.getAuctionProduct().getId()
            );
            if (auctionOrderOpt.isPresent()) {
                statsDTO.setTotalAmount(statsDTO.getTotalAmount().add(BigDecimal.valueOf(auctionOrderOpt.get().getTotalPrice())));
            }
        }

        List<PurchaseStatsDTO> resultList = new ArrayList<>(statsMap.values());
        resultList.sort(Comparator.comparing(PurchaseStatsDTO::getYear).thenComparing(PurchaseStatsDTO::getMonth));
        return resultList;
    }
    public Map<String, Long> getCategoryPurchaseStats(Long userId, int year, Integer month) {
        Map<String, Long> categoryMap = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // ✅ 1. 일반 상품 Orders 처리
        List<Orders> orders = myStatsRepository.findByUserIdAndShippingStateIn(
                userId, List.of(ShippingState.SETTLED, ShippingState.FINISH)
        );

        for (Orders order : orders) {
            LocalDateTime dateTime = LocalDateTime.parse(order.getStartDate(), formatter);
            if (dateTime.getYear() != year) continue;
            if (month != null && dateTime.getMonthValue() != month) continue;

            Product product = order.getProduct();
            if (product == null) continue; // 경매 상품은 패스

            String category = product.getProductCategory();
            long orderTotal = 0;

            for (OrderItem item : order.getOrderItems()) {
                long itemPrice = item.getPrice();
                int discountRate = item.getDiscountRate();
                long afterDiscount = itemPrice * (100 - discountRate) / 100 + item.getAdditionalFee();
                orderTotal += afterDiscount * item.getQuantity();
            }

            orderTotal += order.getShippingFee(); // 배송비 포함
            categoryMap.merge(category, orderTotal, Long::sum);
        }

        // ✅ 2. 경매 상품 Orders 처리 (Orders 기준)
        List<Orders> auctionOrders = orderRepository.findSettledAuctionOrdersByUser(userId);

        for (Orders order : auctionOrders) {
            LocalDateTime dateTime = LocalDateTime.parse(order.getStartDate(), formatter);
            if (dateTime.getYear() != year) continue;
            if (month != null && dateTime.getMonthValue() != month) continue;

            AuctionProduct auctionProduct = order.getAuctionProduct();
            if (auctionProduct == null) continue;

            String category = auctionProduct.getProductCategory();

            Optional<AuctionOrder> auctionOrderOpt = auctionOrderRepository.findById(order.getId());
            if (auctionOrderOpt.isEmpty()) continue;

            long totalPrice = auctionOrderOpt.get().getTotalPrice();

            categoryMap.merge(category, totalPrice, Long::sum);
        }

        return categoryMap;
    }
    public Map<String, Object> getUsedCouponStats(Long userId, int year, Integer month) {
        List<Object[]> raw = couponRepository.getUsedCouponStatsByUser(userId);
        long count = 0;
        long totalDiscount = 0;

        for (Object[] row : raw) {
            int rowYear = (Integer) row[0];
            int rowMonth = (Integer) row[1];
            if (rowYear == year && (month == null || rowMonth == month)) {
                count += ((Number) row[2]).longValue();
                totalDiscount += ((Number) row[3]).longValue();
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("couponCount", count);
        result.put("totalDiscount", totalDiscount);
        return result;
    }
    public SellerSalesSummaryDTO getSalesSummary(Long sellerId, String startDate, String endDate) {
        return orderItemRepository.getSalesSummaryBySellerAndDate(sellerId, startDate, endDate);
    }
    public List<DailySalesDTO> getDailySales(Long sellerId, String start, String end) {
        List<Object[]> raw = orderItemRepository.getDailySalesNative(sellerId, start, end);
        return raw.stream()
                .map(row -> new DailySalesDTO((String) row[0], ((Number) row[1]).longValue()))
                .collect(Collectors.toList());
    }
    public long getRegisteredProductCount(Long sellerId) {
        return productRepository.countActiveProductsBySeller(sellerId);
    }
    public ReviewStatsDTO getFilteredReviewStats(Long userId, String start, String end) {
        List<String> rateStrings = reviewRepository.findRatesByUserAndPeriod(userId, start, end);

        List<Double> rates = rateStrings.stream()
                .map(rate -> {
                    try {
                        String clean = rate.trim().replaceAll("[^\\d.]", "");
                        return Double.parseDouble(clean);
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .toList();

        long count = rates.size();
        double avg = count > 0 ? rates.stream().mapToDouble(Double::doubleValue).average().orElse(0.0) : 0.0;

        return new ReviewStatsDTO(count, avg);
    }

}

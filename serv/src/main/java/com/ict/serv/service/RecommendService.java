package com.ict.serv.service;

import com.ict.serv.dto.recommend.WishRecommendRequest;
import com.ict.serv.entity.basket.Basket;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.product.ProductState;
import com.ict.serv.entity.user.User;
import com.ict.serv.entity.wish.Wishlist;
import com.ict.serv.repository.RecommendRepository;
import com.ict.serv.repository.WishRepository;
import com.ict.serv.repository.basket.BasketRepository;
import com.ict.serv.repository.log.UserHitLogRepository;
import com.ict.serv.repository.order.OrderRepository;
import com.ict.serv.repository.product.ProductRepository;
import com.ict.serv.repository.review.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendService {
    private final RecommendRepository recommendRepository;
    private final WishRepository wishRepository;
    private final BasketRepository basketRepository;
    private final ProductRepository productRepository;
    private final UserHitLogRepository userHitLogRepository;
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;

    public List<Wishlist> getWishListByUser(User user) {
        return wishRepository.findByUser(user);
    }

    public List<Basket> getBasketsByUser(User user) {
        return basketRepository.findByUserNo(user);
    }

    public void buildReviewMaps(Map<Long, Double> avgMap, Map<Long, Integer> countMap) {
        List<Object[]> reviewStats = reviewRepository.getAvgAndCountByProduct();
        for (Object[] row : reviewStats) {
            Long productId = (Long) row[0];
            Double avg = (Double) row[1];
            Long count = (Long) row[2];
            avgMap.put(productId, avg != null ? avg : 0.0);
            countMap.put(productId, count.intValue());
        }
    }

    public Map<Long, Integer> getWishCountMap() {
        return wishRepository.countAllGroupedByProduct().stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((Long) row[1]).intValue()
                ));
    }
    public Map<Long, Integer> getHitCountMap() {
        return userHitLogRepository.countAllGroupedByProduct().stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((Long) row[1]).intValue()
                ));
    }
    public Map<Long, Integer> getOrderCountMap() {
        return orderRepository.countAllGroupedByProduct().stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((Long) row[1]).intValue()
                ));
    }

    private List<Product> applyPriceRangeFilter(List<Product> products, String priceRange) {
        return switch (priceRange) {
            case "under10000" -> products.stream().filter(p -> p.getPrice() < 10000).collect(Collectors.toList());
            case "10000to20000" ->
                    products.stream().filter(p -> p.getPrice() >= 10000 && p.getPrice() < 20000).collect(Collectors.toList());
            case "20000to30000" ->
                    products.stream().filter(p -> p.getPrice() >= 20000 && p.getPrice() < 30000).collect(Collectors.toList());
            case "30000to50000" ->
                    products.stream().filter(p -> p.getPrice() >= 30000 && p.getPrice() < 50000).collect(Collectors.toList());
            case "50000to60000" ->
                    products.stream().filter(p -> p.getPrice() >= 50000 && p.getPrice() < 60000).collect(Collectors.toList());
            case "over60000" -> products.stream().filter(p -> p.getPrice() >= 60000).collect(Collectors.toList());
            default -> products;
        };
    }

    private double getProductScore(Long productId,
                                   Map<Long, Double> ratingAvgMap,
                                   Map<Long, Integer> ratingCountMap,
                                   Map<Long, Integer> wishMap,
                                   Map<Long, Integer> hitMap,
                                   Map<Long, Integer> orderMap) {

        double averageRating = ratingAvgMap.getOrDefault(productId, 0.0);
        int ratingCount = ratingCountMap.getOrDefault(productId, 0);
        int wishCount = wishMap.getOrDefault(productId, 0);
        int hitCount = hitMap.getOrDefault(productId, 0);
        int orderCount = orderMap.getOrDefault(productId, 0);

        return averageRating * 3
                + ratingCount * 0.5
                + wishCount * 1.0
                + hitCount * 0.5
                + orderCount * 2.0;
    }

    public Product defaultRecommend(User user, WishRecommendRequest productIdList) {
        List<Long> excludeIds = productIdList.getProductIds();
        String priceRange = productIdList.getPriceRange();

        List<Product> allProducts = productRepository.findAll().stream()        //판매중이고 수량 0개이상
                .filter(p -> p.getQuantity() > 0 && p.getState() == ProductState.SELL)
                .collect(Collectors.toList());

        if (priceRange != null && !priceRange.isEmpty()) {      //가격 필터링
            allProducts = applyPriceRangeFilter(allProducts, priceRange);
        }

        Map<Long, Double> ratingAvgMap = new HashMap<>();
        Map<Long, Integer> ratingCountMap = new HashMap<>();
        buildReviewMaps(ratingAvgMap, ratingCountMap);
        Map<Long, Integer> wishMap = getWishCountMap();
        Map<Long, Integer> hitMap = getHitCountMap();
        Map<Long, Integer> orderMap = getOrderCountMap();
        //너무 오래걸리니까 캐싱해두려고

        List<Product> sortedProducts = allProducts.stream()
                .filter(p -> !excludeIds.contains(p.getId())) // 이미 본거 걸러주는거
                .map(p -> new AbstractMap.SimpleEntry<>(p, getProductScore(
                        p.getId(), ratingAvgMap, ratingCountMap, wishMap, hitMap, orderMap)))
                .filter(entry -> entry.getValue() > 0)  // 점수가 0 이하인 상품 X
                .sorted(Comparator.comparingDouble((Map.Entry<Product, Double> entry) -> entry.getValue()).reversed())
                .limit(100)
                .map(Map.Entry::getKey)
                .toList();

        if (sortedProducts.isEmpty()) return null;

        return sortedProducts.get(0);  // 가장 높은 점수를 가진 상품 추천
    }



}
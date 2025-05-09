package com.ict.serv.controller.stats;

import com.ict.serv.entity.review.ReviewStatsDTO;
import com.ict.serv.entity.sales.DailySalesDTO;
import com.ict.serv.entity.sales.PurchaseStatsDTO;
import com.ict.serv.entity.sales.SellerSalesSummaryDTO;
import com.ict.serv.repository.product.ProductRepository;
import com.ict.serv.service.InteractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.ict.serv.service.MyStatsService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mystats")
@CrossOrigin(origins = "*")
public class MyStatsController {
    private final MyStatsService myStatsService;
    private final InteractService interactService;
    private final ProductRepository productRepository;

    @GetMapping("/activity/{userId}")
    public Map<String, Object> getMyActivity(
            @PathVariable Long userId,
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> result = new HashMap<>();
        result.put("reviewCount", myStatsService.getReviewCount(userId, year, month));
        result.put("inquiryCount", myStatsService.getInquiryCount(userId, year, month));
        result.put("wishlistCount", myStatsService.getWishlistCount(userId, year, month));
        result.put("userPointHistory", myStatsService.getUserPointHistory(userId, year, month));
        result.put("followerCount", myStatsService.getFollowerCount(userId, year, month));
        result.put("followingCount", myStatsService.getFollowingCount(userId, year, month));
        result.put("monthlyAccessCount", myStatsService.getMonthlyAccessCount(userId, year, month));

        List<Map<String, Object>> topSearchWords = myStatsService.getTopSearchWords(userId, year, month).stream()
                .map(obj -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("searchWord", obj[0]);
                    map.put("count", obj[1]);
                    return map;
                }).collect(Collectors.toList());
        result.put("topSearchWords", topSearchWords);

        result.put("categorySearchRate", myStatsService.getCategorySearchRate(userId, year, month));

        return result;
    }
    @GetMapping("/purchase/{userId}")
    public List<PurchaseStatsDTO> getPurchaseStats(
            @PathVariable Long userId,
            @RequestParam int year,
            @RequestParam(required = false) Integer month
    ) {
        return myStatsService.getMonthlyPurchaseStats(userId, year, month);
    }

    @GetMapping("/purchase/category/{userId}")
    public Map<String, Long> getCategoryStats(
            @PathVariable Long userId,
            @RequestParam int year,
            @RequestParam(required = false) Integer month
    ) {
        return myStatsService.getCategoryPurchaseStats(userId, year, month);
    }

    @GetMapping("/purchase/coupon/{userId}")
    public Map<String, Object> getCouponStats(
            @PathVariable Long userId,
            @RequestParam int year,
            @RequestParam(required = false) Integer month
    ) {
        return myStatsService.getUsedCouponStats(userId, year, month);
    }
    @GetMapping("/sell/{userId}")
    public ResponseEntity<SellerSalesSummaryDTO> getSalesSummary(
            @PathVariable Long userId,
            @RequestParam String start,
            @RequestParam String end
    ) {
        SellerSalesSummaryDTO summary = myStatsService.getSalesSummary(userId, start, end);
        return ResponseEntity.ok(summary);
    }
    @GetMapping("/daily/{userId}")
    public ResponseEntity<List<DailySalesDTO>> getDailySales(
            @PathVariable("userId") Long sellerId,  // ✅ 이름 맞춤
            @RequestParam String start,
            @RequestParam String end) {
        return ResponseEntity.ok(myStatsService.getDailySales(sellerId, start, end));
    }

    @GetMapping("/productcount/{userId}")
    public ResponseEntity<Long> getProductCountByDate(
            @PathVariable Long userId,
            @RequestParam String start,
            @RequestParam String end
    ) {
        Long count = productRepository.countBySellerAndDateRange(userId, start, end);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/review/{userId}")
    public ResponseEntity<ReviewStatsDTO> getReviewStats(
            @PathVariable Long userId,
            @RequestParam String start,
            @RequestParam String end
    ) {
        return ResponseEntity.ok(myStatsService.getFilteredReviewStats(userId, start, end));
    }
}

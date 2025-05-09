package com.ict.serv.controller.recommend;

import com.ict.serv.controller.product.ProductPagingVO;
import com.ict.serv.dto.recommend.WishRecommendRequest;
import com.ict.serv.entity.log.search.SearchLog;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.product.ProductState;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/recommend")
public class RecommendController {
    private final RecommendService recommendService;
    private final InteractService interactService;
    private final ProductService productService;
    private final LogService logService;
    private final ReviewService reviewService;

    @PostMapping("/getDefaultRecommend")
    public Product getDefaultRecommend(@AuthenticationPrincipal UserDetails userDetails,
                                       @RequestBody WishRecommendRequest productIdList) {
        User user = interactService.selectUserByName(userDetails.getUsername());

        return recommendService.defaultRecommend(user, productIdList);
    }

    private List<Product> applyPriceRangeFilter(List<Product> candidates, String priceRange) {
        switch (priceRange) {
            case "under10000":
                return candidates.stream().filter(p -> p.getPrice() < 10000).collect(Collectors.toList());
            case "10000to20000":
                return candidates.stream().filter(p -> p.getPrice() >= 10000 && p.getPrice() < 20000).collect(Collectors.toList());
            case "20000to30000":
                return candidates.stream().filter(p -> p.getPrice() >= 20000 && p.getPrice() < 30000).collect(Collectors.toList());
            case "30000to50000":
                return candidates.stream().filter(p -> p.getPrice() >= 30000 && p.getPrice() < 50000).collect(Collectors.toList());
            case "50000to60000":
                return candidates.stream().filter(p -> p.getPrice() >= 50000 && p.getPrice() < 60000).collect(Collectors.toList());
            case "over60000":
                return candidates.stream().filter(p -> p.getPrice() >= 60000).collect(Collectors.toList());
            default:
                return candidates;
        }
    }

    @PostMapping("/getRecommend")
    public Product getRecommend(@AuthenticationPrincipal UserDetails userDetails,
                                @RequestParam RecommendType type,
                                @RequestBody WishRecommendRequest productIdList) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        String priceRange = productIdList.getPriceRange();
        List<Long> excludeIds = productIdList.getProductIds();

        List<Product> candidates = switch (type) {
            case WISH -> getProductListFromWish(user);
            case BASKET -> getProductListFromBasket(user);
            case HIT -> getProductListFromHit(user);
            case SEARCH -> getProductListFromSearch(user);
            case REVIEW -> getProductListFromReview(user);
        };

        //판매중이고 수량0개이상
        candidates = candidates.stream()
                .filter(p -> p.getQuantity() > 0 && p.getState() == ProductState.SELL)
                .collect(Collectors.toList());

        if (priceRange != null && !priceRange.isEmpty()) {  //가격필터
            candidates = applyPriceRangeFilter(candidates, priceRange);
        }

        Collections.shuffle(candidates);

        for (Product product : candidates) {
            if (!excludeIds.contains(product.getId())) {
                return product;
            }
        }

        return recommendService.defaultRecommend(user, productIdList);
    }


    private List<Product> getProductListFromWish(User user) {
        return recommendService.getWishListByUser(user).stream()
                .map(w -> w.getProduct())
                .collect(Collectors.toList());
    }

    private List<Product> getProductListFromBasket(User user) {
        return recommendService.getBasketsByUser(user).stream()
                .map(b -> b.getOptionNo().getOption().getProduct())
                .collect(Collectors.toList());
    }

    private List<Product> getProductListFromHit(User user) {
        return logService.getHitList(user).stream()
                .map(h -> h.getProduct())
                .collect(Collectors.toList());
    }

    private List<Product> getProductListFromReview(User user) {
        return reviewService.selectMyReviewList(user).stream()
                .map(r -> r.getProduct())
                .collect(Collectors.toList());
    }

    private List<Product> getProductListFromSearch(User user) {
        List<SearchLog> searchList = logService.getSearchList(user);
        List<Product> result = new ArrayList<>();
        for (SearchLog log : searchList) {
            ProductPagingVO pvo = new ProductPagingVO();
            pvo.setSearchWord(log.getSearchWord());
            pvo.setEventCategory(log.getEventCategory());
            pvo.setTargetCategory(log.getTargetCategory());
            pvo.setSort("주문 많은 순");

            List<String> categoryList = new ArrayList<>(List.of(log.getProductCategory().split(",")));
            result.addAll(productService.searchAll(pvo, categoryList));
        }
        return result;
    }
}

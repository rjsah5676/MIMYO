package com.ict.serv.controller.basket;

import com.ict.serv.dto.BasketItemDto;
import com.ict.serv.dto.BasketUpdateDto;
import com.ict.serv.entity.basket.Basket;
import com.ict.serv.entity.product.OptionCategory;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.BasketService;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/basket")
public class BasketController {
    private final InteractService interactService;
    private final BasketService basketService;
    private final ProductService productService;

@PostMapping("/add")
public ResponseEntity<String> addItemsToBasket(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody List<BasketItemDto> items) {
    //System.out.println("잘 오는지 체크!!"+items);
    try {
        for (BasketItemDto item : items) {
            Basket basket = new Basket();
            basket.setBasketQuantity(item.getQuantity());
            basket.setUserNo(interactService.selectUserByName(userDetails.getUsername()));
            OptionCategory opt = new OptionCategory();
            opt.setId(item.getSubOptionId());
            basket.setOptionNo(opt);
            basketService.insertBasket(basket);
        }
        return ResponseEntity.ok("success");
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
        return ResponseEntity.status(500).body("서버 오류가 발생했습니다.");
    }
}

    @GetMapping("/list")
    public ResponseEntity<List<Map<String, Object>>> getBasketItems(@AuthenticationPrincipal UserDetails userDetails) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        List<Map<String, Object>> basketItems = basketService.getBasketItems(user);
        //System.out.println("바스켓서비스=>"+basketItems);
        return ResponseEntity.ok(basketItems);
    }
    @GetMapping("/getProduct")
    public Product getProduct(Long productId) {
        return productService.selectProduct(productId).get();
    }

    @PatchMapping("/update")
    public ResponseEntity<String> updateBasketItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody BasketUpdateDto updateDto) {

        User user = interactService.selectUserByName(userDetails.getUsername());
        boolean updated = basketService.updateBasketItemQuantity(user, updateDto.getBasketNo(), updateDto.getQuantity());

        if (updated) {
            return ResponseEntity.ok("장바구니 아이템 수량이 업데이트되었습니다.");
        } else {
            return ResponseEntity.badRequest().body("장바구니 아이템 업데이트에 실패했습니다.");
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteBasketItems(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, List<Long>> requestBody) {

        List<Long> basketNos = requestBody.get("basketNos");
        if (basketNos == null || basketNos.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = interactService.selectUserByName(userDetails.getUsername());
        basketService.deleteBasketItems(user, basketNos);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/paid/delete")
    public ResponseEntity<String> deletePaidBasketItems(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, List<Long>> requestBody) {
        List<Long> basketNos = requestBody.get("basketNos");
        if (basketNos == null || basketNos.isEmpty()) {
            return ResponseEntity.badRequest().body("삭제할 장바구니 항목이 없습니다.");
        }
        User user = interactService.selectUserByName(userDetails.getUsername());
        basketService.deleteBasketItems(user, basketNos);

        return ResponseEntity.ok("선택한 장바구니 상품이 삭제되었습니다.");
    }
}

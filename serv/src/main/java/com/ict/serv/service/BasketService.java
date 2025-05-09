package com.ict.serv.service;

import com.ict.serv.entity.basket.Basket;
import com.ict.serv.entity.order.OrderGroup;
import com.ict.serv.entity.order.OrderItem;
import com.ict.serv.entity.order.OrderState;
import com.ict.serv.entity.product.Option;
import com.ict.serv.entity.product.OptionCategory;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.basket.BasketRepository;
import com.ict.serv.repository.order.OrderGroupRepository;
import com.ict.serv.repository.product.OptionCategoryRepository;
import com.ict.serv.repository.product.OptionRepository;
import com.ict.serv.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BasketService {
    private final BasketRepository basketRepository;
    private final ProductRepository productRepository;
    private final OptionRepository optionRepository;
    private final OptionCategoryRepository optionCategoryRepository;
    private final OrderGroupRepository orderGroupRepository;

    @Transactional
    public void insertBasket(Basket basket) {
        User user = basket.getUserNo();
        Long optionCategoryId = basket.getOptionNo().getId();

        List<Basket> existingBaskets = basketRepository.findByUserNo(user);
        Basket existingBasket = existingBaskets.stream()
                .filter(b -> b.getOptionNo().getId().equals(optionCategoryId))
                .findFirst()
                .orElse(null);

        OptionCategory optionCategory = optionCategoryRepository.findById(optionCategoryId).orElse(null);
        if (optionCategory == null) {
            throw new IllegalArgumentException("해당 옵션이 존재하지 않습니다.");
        }

        int currentBasketQty = existingBasket != null ? existingBasket.getBasketQuantity() : 0;
        int totalRequestedQty = currentBasketQty + basket.getBasketQuantity();

        if (totalRequestedQty > optionCategory.getQuantity()) {
            System.out.println("장바구니 재고 만땅 상태인데 추가!!!!!! 노노 할 수 없삼");
            throw new IllegalArgumentException("재고 수량을 초과하여 장바구니에 담을 수 없습니다.");
        }

        if (existingBasket != null) {
            existingBasket.setBasketQuantity(totalRequestedQty);
            basketRepository.save(existingBasket);
        } else {
            basketRepository.save(basket);
        }
    }

    public List<Map<String, Object>> getBasketItems(User user) {
        List<Basket> baskets = basketRepository.findByUserNo(user);

        return baskets.stream().map(basket -> {
            Map<String, Object> item = new HashMap<>();
            Product product = basket.getProductNo();
            item.put("basketNo", basket.getId());
            OptionCategory opt_c = basket.getOptionNo();
            item.put("categoryName",opt_c.getCategoryName());
            item.put("categoryQuantity",opt_c.getQuantity());
            item.put("additionalPrice",opt_c.getAdditionalPrice());
            Option opt = opt_c.getOption();
            item.put("optionName",opt.getOptionName());
            Product prod = opt.getProduct();
            item.put("productImage",prod.getImages().get(0).getFilename());
            item.put("productNo",prod.getId());
            item.put("productDiscountRate", prod.getDiscountRate());
            item.put("productPrice",prod.getPrice());
            item.put("productShippingFee",prod.getShippingFee());
            item.put("productName",prod.getProductName());
            item.put("sellerNo", prod.getSellerNo().getId());
            item.put("sellerName",prod.getSellerNo().getUsername());
            item.put("quantity", basket.getBasketQuantity());
            item.put("optionCategoryId", opt_c.getId());
            //System.out.println("items!!!!"+item);
            return item;
        }).collect(Collectors.toList());
    }

    @Transactional
    public boolean updateBasketItemQuantity(User user, Long basketNo, int quantity) {
        Optional<Basket> optionalBasket = basketRepository.findByIdAndUserNo(basketNo, user);
        if (optionalBasket.isPresent()) {
            Basket basket = optionalBasket.get();
            basket.setBasketQuantity(quantity);
            return true;
        }
        return false;
    }

    @Transactional
    public void deleteBasketItems(User user, List<Long> basketNos) {
        List<Basket> basketsToDelete = basketRepository.findByUserNoAndIdIn(user, basketNos);
        basketRepository.deleteAll(basketsToDelete);
    }

    @Transactional
    public void deletePaidBasketItems(User user, List<Long> basketNos) {
        List<OrderGroup> paidOrderGroups = orderGroupRepository.findAllByUserAndStateOrderByOrderDateDesc(
                user, OrderState.PAID, PageRequest.of(0, Integer.MAX_VALUE)
        );

        List<Long> paidOptionCategoryIds = paidOrderGroups.stream()
                .flatMap(orderGroup -> orderGroup.getOrders().stream())
                .flatMap(orders -> orders.getOrderItems().stream())
                .map(OrderItem::getOptionCategoryId)
                .distinct()
                .collect(Collectors.toList());

        List<Basket> basketsToDelete = basketRepository.findByUserNoAndIdIn(user, basketNos).stream()
                .filter(basket -> paidOptionCategoryIds.contains(basket.getOptionNo().getId()))
                .collect(Collectors.toList());

        basketRepository.deleteAll(basketsToDelete);
    }
}



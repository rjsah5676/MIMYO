package com.ict.serv.service;

import com.ict.serv.controller.product.ProductPagingVO;
import com.ict.serv.entity.product.*;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.product.OptionCategoryRepository;
import com.ict.serv.repository.product.OptionRepository;
import com.ict.serv.repository.product.ProductImageRepository;
import com.ict.serv.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Order;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository repo;
    private final ProductImageRepository image_repo;
    private final OptionRepository optionRepository;
    private final OptionCategoryRepository optionCategoryRepository;

    public Product saveProduct(Product product){
        return repo.save(product);
    }

    public void saveProductImage(ProductImage productImage) {
        image_repo.save(productImage);
    }

    public List<ProductImage> getImages(Product product) {
        return image_repo.findAllByProduct(product);
    }

    public int totalRecord(ProductPagingVO pvo){
        return repo.countByProductNameContaining(pvo.getSearchWord());
    }

    public List<Product> getProductList(ProductPagingVO pvo) {
        return repo.findAllByProductNameContainingAndEventCategoryContainingAndTargetCategoryContainingAndProductCategoryContaining(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(), pvo.getProductCategory(), PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
    }
    public int searchCountAll(ProductPagingVO pvo, List<String> categories) {
        if(categories.isEmpty()|| categories.get(0).isEmpty()) return repo.countProductsNoCategory(pvo.getSearchWord(),pvo.getEventCategory(),pvo.getTargetCategory());
        else return repo.countProductsAllCategory(pvo.getSearchWord(),pvo.getEventCategory(),pvo.getTargetCategory(), categories);
    }
    public List<Product> searchAll(ProductPagingVO pvo, List<String> categories) {
        switch (pvo.getSort()) {
            case "최신순" -> {
                if (categories.isEmpty() || categories.get(0).isEmpty()) {
                    return repo.findProductsNoCategory(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(), ProductState.SELL, PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord(), Sort.by(Order.desc("start_date"))));
                } else
                    return repo.findProductsAllCategory(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(), categories,ProductState.SELL, PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord(), Sort.by(Order.desc("start_date"))));
            }
            case "높은 가격 순" -> {
                if (categories.isEmpty() || categories.get(0).isEmpty()) {
                    return repo.findProductsNoCategory(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(),ProductState.SELL, PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord(), Sort.by(Order.desc("price"))));
                } else
                    return repo.findProductsAllCategory(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(), categories,ProductState.SELL, PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord(), Sort.by(Order.desc("price"))));
            }
            case "낮은 가격 순" -> {
                if (categories.isEmpty() || categories.get(0).isEmpty()) {
                    return repo.findProductsNoCategory(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(),ProductState.SELL, PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord(), Sort.by(Order.asc("price"))));
                } else
                    return repo.findProductsAllCategory(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(), categories,ProductState.SELL, PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord(), Sort.by(Order.asc("price"))));
            }
            case "할인율 높은 순" -> {
                if (categories.isEmpty() || categories.get(0).isEmpty()) {
                    return repo.findProductsNoCategory(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(),ProductState.SELL, PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord(), Sort.by(Order.desc("discount_rate"))));
                } else
                    return repo.findProductsAllCategory(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(), categories,ProductState.SELL, PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord(), Sort.by(Order.desc("discount_rate"))));
            }
            case "찜 많은순" -> {
                if (categories.isEmpty() || categories.get(0).isEmpty()) {
                    return repo.findProductsNoCategoryOrderByWishCount(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(),ProductState.SELL, PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord()));
                } else {
                    return repo.findProductsAllCategoryOrderByWishCount(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(), categories,ProductState.SELL, PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord()));
                }
            }
            case "후기 많은 순" -> {
                if (categories.isEmpty() || categories.get(0).isEmpty()) {
                    return repo.findProductsNoCategoryOrderByReviewCount(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(),ProductState.SELL, PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord()));
                } else {
                    return repo.findProductsAllCategoryOrderByReviewCount(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(), categories,ProductState.SELL, PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord()));
                }
            }
            case "주문 많은 순" -> {
                if (categories.isEmpty() || categories.get(0).isEmpty()) {
                    return repo.findProductsNoCategoryOrderByOrderCount(
                            pvo.getSearchWord(),
                            pvo.getEventCategory(),
                            pvo.getTargetCategory(),
                            ProductState.SELL,
                            PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord())
                    );
                } else {
                    return repo.findProductsAllCategoryOrderByOrderCount(
                            pvo.getSearchWord(),
                            pvo.getEventCategory(),
                            pvo.getTargetCategory(),
                            categories,
                            ProductState.SELL,
                            PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord())
                    );
                }
            }
        }
        if(categories.isEmpty() || categories.get(0).isEmpty()) {
            return repo.findProductsNoCategory(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(),ProductState.SELL, PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord()));
        }else return repo.findProductsAllCategory(pvo.getSearchWord(),pvo.getEventCategory(),pvo.getTargetCategory(), categories,ProductState.SELL,PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
    }

    public List<Product> searchAllNoPaging(List<String> categories) {
        return repo.findProductsAllCategoryNoPaging(categories);
    }

    public Option saveOption(Option option) {
        return optionRepository.save(option);
    }
    public OptionCategory saveOptionCategory(OptionCategory optionCategory) {
        return optionCategoryRepository.save(optionCategory);
    }

    public Optional<Product> selectProduct(Long id) {
        return repo.findById(id);
    }

    public List<Option> selectOptions(Product product){
        return optionRepository.findByProduct(product);
    }

    public Optional<OptionCategory> selectOptionCategory(Long id) { return optionCategoryRepository.findById(id);}

    public List<Product> selectProductByUser(User user) { return repo.findAllBySellerNo(user);}

    public List<Product> getRAWList(){ return repo.findTop10PopularProductsByRating(); }

    public List<Product> selectAllProduct() {
        return repo.findAll();
    }

    public Optional<Product> findProductById(Long id) {
        return repo.findById(id);
    }

    public void deleteOptionsByProduct(Product product) {
        List<Option> options = optionRepository.findAllByProduct(product);

        for (Option option : options) {
            optionCategoryRepository.deleteAllByOption(option);
        }

        optionRepository.deleteAll(options);
    }
}

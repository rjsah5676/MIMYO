package com.ict.serv.controller.product;

import com.ict.serv.entity.product.*;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/product")
public class ProductController {
    private final InteractService interactService;
    private final ProductService service;
    private final OrderService orderService;
    private final LogService logService;
    private final ReviewService reviewService;

    @PostMapping("/write")
    @Transactional(rollbackFor = {RuntimeException.class, SQLException.class})
    public ResponseEntity<String> write(@RequestPart("product") ProductWriteRequest productRequest,
                                        @RequestParam(value = "files", required = false) MultipartFile[] files,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        List<File> savedFiles = new ArrayList<>();

        try {
            User seller = interactService.selectUserByName(userDetails.getUsername());

            Product product;
            boolean isUpdate = productRequest.getId() != null;

            if (isUpdate) {
                product = service.findProductById(productRequest.getId())
                        .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

                if (!product.getSellerNo().getId().equals(seller.getId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("권한이 없습니다.");
                }

                service.deleteOptionsByProduct(product);

                if (product.getImages() != null) {
                    product.getImages().removeIf(img ->
                            productRequest.getOriginalImages() == null ||
                                    !productRequest.getOriginalImages().contains(img.getFilename())
                    );
                }
            } else {
                product = new Product();
                product.setSellerNo(seller);
                product.setImages(new ArrayList<>());
            }

            product.setProductName(productRequest.getProductName());
            product.setEventCategory(productRequest.getEventCategory());
            product.setTargetCategory(productRequest.getTargetCategory());
            product.setProductCategory(productRequest.getProductCategory());
            product.setDetail(productRequest.getDetail());
            product.setPrice(productRequest.getPrice());
            product.setQuantity(productRequest.getQuantity());
            product.setDiscountRate((int)productRequest.getDiscountRate());
            product.setShippingFee(productRequest.getShippingFee());
            if(product.getQuantity() > 0) product.setState(ProductState.SELL);
            // 옵션 등록
            if (productRequest.getOptions() != null && !productRequest.getOptions().isEmpty()) {
                for (OptionDTO optionDTO : productRequest.getOptions()) {
                    Option mainOption = new Option();
                    mainOption.setProduct(product);
                    mainOption.setOptionName(optionDTO.getMainOptionName());
                    mainOption.setSubOptionCategories(new ArrayList<>());

                    Option savedOption = service.saveOption(mainOption);

                    if (optionDTO.getSubOptions() != null && !optionDTO.getSubOptions().isEmpty()) {
                        for (SubOptionDTO subOptionDTO : optionDTO.getSubOptions()) {
                            OptionCategory optionCategory = new OptionCategory();
                            optionCategory.setCategoryName(subOptionDTO.getSubOptionName());
                            optionCategory.setQuantity(subOptionDTO.getQuantity());
                            optionCategory.setAdditionalPrice(subOptionDTO.getAdditionalPrice());
                            optionCategory.setOption(savedOption);
                            service.saveOptionCategory(optionCategory);
                            savedOption.getSubOptionCategories().add(optionCategory);
                        }
                    }
                    service.saveOption(savedOption);
                }
            }

            Product savedProduct = service.saveProduct(product);

            if (files != null) {
                String uploadDir = System.getProperty("user.dir") + "/uploads/product/" + savedProduct.getId();
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();

                for (MultipartFile file : files) {
                    if (file.isEmpty()) continue;
                    String originalFilename = file.getOriginalFilename();
                    if (originalFilename == null) continue;

                    File destFile = new File(uploadDir, originalFilename);
                    int point = originalFilename.lastIndexOf(".");
                    String baseName = originalFilename.substring(0, point);
                    String extension = originalFilename.substring(point + 1);

                    int count = 1;
                    while (destFile.exists()) {
                        String newFilename = baseName + "(" + count + ")." + extension;
                        destFile = new File(uploadDir, newFilename);
                        count++;
                    }
                    file.transferTo(destFile);
                    savedFiles.add(destFile);

                    ProductImage productImage = new ProductImage();
                    productImage.setFilename(destFile.getName());
                    productImage.setSize((int) destFile.length());
                    productImage.setProduct(savedProduct);

                    savedProduct.getImages().add(productImage);
                }
                service.saveProduct(savedProduct);
            }

            return ResponseEntity.ok(isUpdate ? "상품 수정 성공" : "상품 등록 성공");
        } catch (Exception e) {
            e.printStackTrace();
            for (File delFile : savedFiles) {
                delFile.delete();
            }
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("상품 등록/수정 실패");
        }
    }



    @GetMapping("/search")
    public Map<String, Object> searchProducts(ProductPagingVO pvo, @AuthenticationPrincipal UserDetails userDetails, HttpServletRequest request) {
        User user = null;
        if (userDetails != null) {
            user = interactService.selectUserByName(userDetails.getUsername());
        }
        String ip = request.getRemoteAddr();

        String keyword = pvo.getSearchWord();
        String ec = pvo.getEventCategory();
        String tc = pvo.getTargetCategory();
        String pc = pvo.getProductCategory();

//        LocalDateTime limit = LocalDateTime.now().minusHours(3);
        LocalDateTime limit = LocalDateTime.now().minusSeconds(1);
        logService.saveSearch(user, ip, keyword, ec, tc, pc, limit);

        pvo.setOnePageRecord(12);
        String[] cats = pvo.getProductCategory().split(",");
        List<String> categories = new ArrayList<>(Arrays.asList(cats));
        pvo.setTotalRecord(service.searchCountAll(pvo,categories));
        List<Product> productList = service.searchAll(pvo,categories);

        Map<String, Object> result = new HashMap<>();
        result.put("productList",productList);
        result.put("pvo",pvo);
        return result;
    }

    @GetMapping("/getOption")
    public List<Option> getOption(Long id, HttpServletRequest request) {
        Product product = service.selectProduct(id).get();
        User user = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            user = interactService.selectUserByName(userDetails.getUsername());
        }
        logService.logProductHit(user,product,request.getRemoteAddr());
        return service.selectOptions(product);
    }

    @GetMapping("/getList/hotCategory")
    public List<HotCategoryDTO> hotCategory() {
        return orderService.getHotCategory();
    }

    @GetMapping("/getList/byCategory")
    public List<Product> byCategory(String category) {
        List<String> categories = new ArrayList<>();
        categories.add(category);

        List<Product> productList = service.searchAllNoPaging(categories);

        if (productList.size() > 10) {
            Collections.shuffle(productList);
            return productList.subList(0, 10);
        }

        return productList;
    }

    @GetMapping("/getList/getRAW")
    public List<RAWDTO> getRAW() {
        List<Product> productList = service.getRAWList();
        List<RAWDTO> rawList = new ArrayList<>();
        for(Product product:productList){
            int review_count = reviewService.productReviewList(product).size();
            int wish_count = interactService.selectWishCountByProduct(product);
            if(!product.getImages().isEmpty()) {
                RAWDTO raw = new RAWDTO(product.getId(), product.getProductName(), product.getPrice(), product.getQuantity(), product.getShippingFee(), product.getDiscountRate(), product.getImages().get(0), product.getRating(), review_count, wish_count);
                rawList.add(raw);
            }
        }
        return rawList;
    }
    @GetMapping("/getInfo")
    public Product getInfo(Long productId) {
        return service.selectProduct(productId).get();
    }

    @GetMapping("/downProduct")
    public void downProduct(Long id) {
        Product product = service.selectProduct(id).get();
        product.setState(ProductState.PAUSE);
        service.saveProduct(product);
    }
}

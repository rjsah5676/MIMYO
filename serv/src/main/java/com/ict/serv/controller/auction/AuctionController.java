package com.ict.serv.controller.auction;

import com.ict.serv.controller.product.ProductPagingVO;
import com.ict.serv.entity.auction.*;
import com.ict.serv.entity.order.OrderPagingVO;
import com.ict.serv.entity.product.*;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.AuctionService;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.sql.SQLException;
import java.util.*;

@RestController
@RequestMapping("/auction")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuctionController {

    private final ProductService productService;
    private final AuctionService service;
    private final InteractService inter_service;

    @PostMapping("/write")
    @Transactional(rollbackFor = {RuntimeException.class, SQLException.class})
    public ResponseEntity<String> write(@RequestPart("auction")AuctionWriteRequest req, @RequestParam("files") MultipartFile[] files,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        List<File> savedFiles = new ArrayList<>();
        AuctionRoom auctionRoom = new AuctionRoom();
        AuctionProduct auctionProduct = new AuctionProduct();
        auctionProduct.setShippingFee(req.getShippingFee());
        auctionProduct.setDetail(req.getDetail());
        auctionProduct.setSellerNo(inter_service.selectUserByName(userDetails.getUsername()));
        auctionProduct.setProductName(req.getProductName());
        auctionProduct.setEventCategory(req.getEventCategory());
        auctionProduct.setTargetCategory(req.getTargetCategory());
        auctionProduct.setProductCategory(req.getProductCategory());
        auctionProduct.setImages(new ArrayList<>());

        if (req.getOptions() != null && !req.getOptions().isEmpty()) {
            for (OptionDTO optionDTO : req.getOptions()) {
                Option mainOption = new Option();
                mainOption.setAuctionProduct(auctionProduct);
                mainOption.setOptionName(optionDTO.getMainOptionName());
                mainOption.setSubOptionCategories(new ArrayList<>());

                Option savedOption = productService.saveOption(mainOption);

                if (optionDTO.getSubOptions() != null && !optionDTO.getSubOptions().isEmpty()) {
                    for (SubOptionDTO subOptionDTO : optionDTO.getSubOptions()) {
                        OptionCategory optionCategory = new OptionCategory();
                        optionCategory.setCategoryName(subOptionDTO.getSubOptionName());
                        optionCategory.setQuantity(subOptionDTO.getQuantity());
                        optionCategory.setAdditionalPrice(subOptionDTO.getAdditionalPrice());
                        optionCategory.setOption(savedOption);
                        productService.saveOptionCategory(optionCategory);
                        savedOption.getSubOptionCategories().add(optionCategory);
                    }
                }
                productService.saveOption(savedOption);
            }
        }
        AuctionProduct savedAuctionProduct = service.saveAuctionProduct(auctionProduct);
        try{
            String uploadDir = System.getProperty("user.dir") + "/uploads/auction/product/" + savedAuctionProduct.getId();
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

                AuctionProductImage productImage = new AuctionProductImage();
                productImage.setFilename(destFile.getName());
                productImage.setSize((int) destFile.length());
                productImage.setAuctionProduct(savedAuctionProduct);

                savedAuctionProduct.getImages().add(productImage);
            }

            service.saveAuctionProduct(savedAuctionProduct);
            String roomId = service.createRoom(inter_service.selectUserByName(userDetails.getUsername()), "", req, savedAuctionProduct);

            return ResponseEntity.ok("상품 등록 성공");
        } catch (Exception e) {
            e.printStackTrace();
            for (File delFile : savedFiles) {
                delFile.delete();
            }
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("상품 등록 실패");
        }
    }

    @GetMapping("/createRoom")
    public ResponseEntity<Map<String, String>> createRoom(String subject, String userid) {

        String roomId = service.createRoom(inter_service.selectUserByName(userid), subject, null,null);
        Map<String, String> response = new HashMap<>();
        response.put("roomId", roomId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<AuctionRoom>> getRooms() {
        return ResponseEntity.ok(
                service.getOpenRooms());
    }

    @GetMapping("/bids/{roomId}")
    public ResponseEntity<List<AuctionBid>> getBids(@PathVariable String roomId) {
        return ResponseEntity.ok(service.getBids(roomId));
    }

    @GetMapping("/room/delete/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String roomId) {
        service.deleteRoom(roomId);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/getAuctionItem/{roomId}")
    public ResponseEntity<AuctionRoom> getAuctionItem(@PathVariable String roomId){
        return ResponseEntity.ok(service.getAuctionRoom(roomId).get());
    }

    @GetMapping("/getAuctionMap")
    public Map<String, List<AuctionRoom>> getAuctionMap() {
        List<AuctionRoom> hotRooms = service.getHotAuctionRooms();
        List<AuctionRoom> closingRooms = service.getClosingAuctionRooms();

        Map<String, List<AuctionRoom>> result = new HashMap<>();
        result.put("hotRooms", hotRooms);
        result.put("closingRooms", closingRooms);

        return result;
    }

    @GetMapping("/search")
    public Map<String, Object> searchProducts(ProductPagingVO pvo) {
        pvo.setOnePageRecord(10);
        String[] cats = pvo.getProductCategory().split(",");
        List<String> categories = new ArrayList<>(Arrays.asList(cats));
        pvo.setTotalRecord(service.searchCountAll(pvo,categories));
        List<AuctionProduct> productList = service.searchAll(pvo,categories);
        List<AuctionResponseDTO> auctionList = new ArrayList<>();
        for(AuctionProduct product : productList) {
            List<AuctionRoom> rooms = service.findAuctionRoomByAuctionProduct(product);
            if(!rooms.isEmpty()) {
                AuctionResponseDTO dto = new AuctionResponseDTO();
                dto.setRoom(rooms.get(0));
                dto.setProduct(product);
                auctionList.add(dto);
            }
        }
        Map<String, Object> result = new HashMap<>();
        result.put("auction",auctionList);
        result.put("pvo",pvo);
        return result;
    }
    @GetMapping("/getBidList")
    public Map getBidList(@AuthenticationPrincipal UserDetails userDetails, BidPagingVO pvo) {
        pvo.setOnePageRecord(5);
        User user = inter_service.selectUserByName(userDetails.getUsername());
        pvo.setTotalRecord(service.totalAuctionBidCount(user, pvo));
        Map map = new HashMap();
        map.put("pvo", pvo);
        map.put("bidList", service.searchAuctionBid(user,pvo));
        return map;
    }

    @GetMapping("/getSellBidList")
    public Map getSellBidList(@AuthenticationPrincipal UserDetails userDetails, BidPagingVO pvo) {
        pvo.setOnePageRecord(5);
        User user = inter_service.selectUserByName(userDetails.getUsername());
        pvo.setTotalRecord(service.totalAuctionSellBidCount(user,pvo));
        Map map = new HashMap();
        map.put("pvo", pvo);
        map.put("bidList", service.searchAuctionSellBid(user,pvo));
        return map;
    }

    @GetMapping("/getRoomId")
    public String getRoomId(Long productId) {
        return service.getAuctionRoomByProduct(service.getAuctionProduct(productId));
    }
}

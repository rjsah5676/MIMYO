package com.ict.serv.controller;

import com.ict.serv.controller.admin.PagingVO;
import com.ict.serv.dto.UserPwdModDto;
import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.order.ShippingState;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.report.ReportState;
import com.ict.serv.entity.review.Review;
import com.ict.serv.entity.user.Address;
import com.ict.serv.entity.user.AddressState;
import com.ict.serv.entity.user.Guestbook;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.order.OrderRepository;
import com.ict.serv.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.SQLOutput;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@RequestMapping("/mypage")
public class MypageController {
    private final MypageService service;
    private final InteractService interactService;
    private final AuthService authService;
    private final ProductService productService;
    private final ReviewService reviewService;
    private final OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/reportList")
    public Map reportList(@AuthenticationPrincipal UserDetails userDetails, PagingVO pvo) {
        pvo.setOnePageRecord(5);
        User user = interactService.selectUserByName(userDetails.getUsername());
        pvo.setTotalRecord(service.totalReportRecord(user));
        Map map = new HashMap();
        map.put("pvo", pvo);
        map.put("reportList", service.getReportByUserFrom(user,pvo));

        return map;
    }

    @GetMapping("/guestbookList")
    public List<Guestbook> guestbookList(User user) {
        return service.selectGuestbookAll(user);
    }

    @GetMapping("/replyList/{id}")
    public List<Guestbook> replyList(@PathVariable int id) {
        return service.selectReplyAll(id);
    }

    @PostMapping("/guestbookWrite")
    public void guestbookWrite(@RequestBody Guestbook guestbook) {
        service.insertGuestbook(guestbook);
    }

    @GetMapping("/guestbookDelete/{id}")
    public void guestbookDelete(@PathVariable int id) {
        service.deleteGuestbook(service.selectGuestbookById(id).get());
    }

    @GetMapping("/productList/{id}")
    public List<Product> productList(@PathVariable long id) {
        return service.selectProductBySellerNo(id);
    }

    @GetMapping("/myInfoCount")
    public Map<String, Object> myInfoCount(User user) {
        int followerCount = interactService.getFollowerList(user.getId()).size();
        int followingCount = interactService.getFollowingList(user.getId()).size();
        int wishCount = service.getWishCount(user.getId());

        List<Product> productList = productService.selectProductByUser(user);
        int reviewCount = reviewService.countAllByProductList(productList);
        List<Review> reviewList = new ArrayList<>();
        float total = 0;
        for(Product product:productList) {
            reviewList.addAll(reviewService.productReviewList(product));
        }
        for(Review review: reviewList) {
            total+= Float.parseFloat(review.getRate());
        }

        Map<String, Object> info = new HashMap<>();
        info.put("followerCount", followerCount);
        info.put("followingCount", followingCount);
        info.put("wishCount", wishCount);
        info.put("rating", reviewCount == 0 ? 0 : total / reviewCount);
        info.put("reviewCount", reviewCount);

        return info;
    }

    @GetMapping("/myFollow")
    public Map<String, List<User>> myFollow(User user) {
        List<User> followerList = interactService.getFollowerList(user.getId());
        List<User> followingList = interactService.getFollowingList(user.getId());

        Map<String, List<User>> myFollow = new HashMap<>();
        myFollow.put("followerList", followerList);
        myFollow.put("followingList", followingList);

        return myFollow;
    }

    @GetMapping("/getAddrList")
    public List<Address> getAddrList(@AuthenticationPrincipal UserDetails userDetails) {
        return service.getAddrList(interactService.selectUserByName(userDetails.getUsername()));
    }

    @PostMapping("/insertAddrList")
    public Address insertAddrList(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Address address) {
        address.setUser(interactService.selectUserByName(userDetails.getUsername()));
        address.setCreatedDate(LocalDateTime.now());
        address.setModifiedDate(LocalDateTime.now());

        System.out.println(address);
        return service.insertAddress(address);
    }

    /* 개인 정보 수정 */
    @GetMapping("/getUser")
    public Optional<User> getUser(@AuthenticationPrincipal UserDetails userDetails){
        User user = interactService.selectUserByName(userDetails.getUsername());
        System.out.println(user.getId());

        Optional<User> getUserInfo = service.selectUserInfo(user);

        return getUserInfo;
    }

    @PostMapping("/editInfo")
    public ResponseEntity<String> editInfo(@AuthenticationPrincipal UserDetails userDetails,
                                           @RequestPart(value = "user") User user,
                                           @RequestPart(value = "profileImage", required = false) MultipartFile profileImage){
        // 임시 백업용 파일 참조 선언
        File backupFile = null;

        try {
            // 로그인된 사용자 정보 가져오기
            User userInfo = interactService.selectUserByName(userDetails.getUsername());

            String kakaoProFileUrl = userInfo.getKakaoProfileUrl(); // 카카오 URL 인지 아닌지 확인
            if (kakaoProFileUrl != null && !kakaoProFileUrl.isEmpty()) { // 카카오 로그인이고, 프로필 사진 변경하고 싶을때
                System.out.println("==================카카오로그인일때=========================");

                if(kakaoProFileUrl.contains("/profile/")){
                    // 카카오 프로필 링크에 /profile/ 링크가 있으면 덮어씌우기
                    if (profileImage != null && !profileImage.isEmpty() && kakaoProFileUrl != null) {
                        // 전체 시스템 절대 경로 만들기
                        Path savePath = Paths.get(System.getProperty("user.dir"), kakaoProFileUrl).normalize();
                        File targetFile = savePath.toFile();

                        // 백업 파일 경로 (원본 경로 + ".bak")
                        backupFile = new File(targetFile.getAbsolutePath() + ".bak");

                        // 기존 파일이 있으면 백업
                        if (targetFile.exists()) {
                            Files.copy(targetFile.toPath(), backupFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                        }

                        // 디렉토리 없으면 생성
                        File parentDir = targetFile.getParentFile();
                        if (!parentDir.exists()) {
                            parentDir.mkdirs();
                        }

                        // 덮어쓰기 저장
                        profileImage.transferTo(targetFile);
                        System.out.println("카카오 프로필 이미지 덮어쓰기 완료: " + savePath.toString());
                    }

                }else{
                    // 카카오 프로필 링크에 /profile/가 없으면 덮어씌우는게 아니라 새로 이미지 파일 추가하기
                    String uploadDir = System.getProperty("user.dir") + "/uploads/user/profile";    //path는 무조건 이 경로
                    File dir = new File(uploadDir);
                    if (!dir.exists()) {
                        dir.mkdirs();
                    }

                    String uploadedProfileUrl = null;

                    if (profileImage != null && !profileImage.isEmpty()) {
                        String fileName = UUID.randomUUID().toString() + "_" + profileImage.getOriginalFilename();
                        File dest = new File(uploadDir, fileName);
                        profileImage.transferTo(dest);
                        uploadedProfileUrl = "/uploads/user/profile/" + fileName;
                    }

                    userInfo.setUploadedProfileUrl(uploadedProfileUrl);
                }
            }else { // 카카오 로그인이 아니고, 프로필 사진 변경하고 싶을때
                System.out.println("==================카카오로그인이 아닐때=========================");
                // 현재 프로필 이미지 링크
                String currentImageUrl = userInfo.getUploadedProfileUrl();
                if(currentImageUrl != null) {
                    // 이미지 덮어쓰기 처리
                    if (profileImage != null && !profileImage.isEmpty() && currentImageUrl != null) {
                        // 전체 시스템 절대 경로 만들기
                        Path savePath = Paths.get(System.getProperty("user.dir"), currentImageUrl).normalize();
                        File targetFile = savePath.toFile();

                        // 백업 파일 경로 (원본 경로 + ".bak")
                        backupFile = new File(targetFile.getAbsolutePath() + ".bak");

                        // 기존 파일이 있으면 백업
                        if (targetFile.exists()) {
                            Files.copy(targetFile.toPath(), backupFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                        }

                        // 디렉토리 없으면 생성
                        File parentDir = targetFile.getParentFile();
                        if (!parentDir.exists()) {
                            parentDir.mkdirs();
                        }

                        // 덮어쓰기 저장
                        profileImage.transferTo(targetFile);
                        System.out.println("프로필 이미지 덮어쓰기 완료: " + savePath.toString());
                    }
                }
            }
            if ((profileImage == null || profileImage.isEmpty()) && user.getUploadedProfileUrl() != null) {
                userInfo.setUploadedProfileUrl(user.getUploadedProfileUrl());
            }
            userInfo.setAddress(user.getAddress());
            userInfo.setZipcode(user.getZipcode());
            userInfo.setAddressDetail(user.getAddressDetail());
            userInfo.setUsername(user.getUsername());
            userInfo.setInfoText(user.getInfoText());

            authService.saveUser(userInfo);

            // 성공하면 백업 파일 삭제
            if(backupFile != null && backupFile.exists()){
                backupFile.delete();
            }

            return ResponseEntity.ok("editInfoOk");
        } catch (Exception e) {
            // 실패 시 백업이미지 복구
            try{
                if(backupFile != null && backupFile.exists()) {
                    String restorePath = backupFile.getAbsolutePath().replace(".bak", "");
                    Files.move(backupFile.toPath(), Paths.get(restorePath), StandardCopyOption.REPLACE_EXISTING);
                }
            } catch (IOException ioException){
                ioException.printStackTrace();
            }
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원정보 수정 실패: " + e.getMessage());
        }
    }

    @PostMapping("/pwdCheck")
    public ResponseEntity<String> pwdCheck(@AuthenticationPrincipal UserDetails userDetails, @RequestBody UserPwdModDto userPwdModDto){
        System.out.println(userPwdModDto.toString()); // 현재 아이디, 확인할 현재 비밀번호, 수정할 비밀번호

        User user = new User();
        user.setId(userPwdModDto.getUserId());
        Optional<User> selectUser = service.selectUserInfo(user); // 현재 아이디값으로 사용자 정보 불러오기

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        if(encoder.matches(userPwdModDto.getCurrentUserPw(), selectUser.get().getUserpw())){ // 비밀번호가 같을때
            return  ResponseEntity.ok("pwdCheckOk");
        }else{ // 비밀번호가 다를때
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("pwdCheckFail");
        }

    }

    @PostMapping("/pwdEdit")
    public ResponseEntity<String> pwdEdit(@AuthenticationPrincipal UserDetails userDetails, @RequestBody UserPwdModDto userPwdModDto){
        System.out.println(userPwdModDto.toString());

        User updated_user = interactService.selectUserByName(userDetails.getUsername());

        // 비밀번호 암호화
        String encryptedPw = passwordEncoder.encode(userPwdModDto.getModUserPw());
        updated_user.setUserpw(encryptedPw);

        authService.saveUser(updated_user); // 비밀번호 수정

        return  ResponseEntity.ok("pwdEditOk");
    }

    @GetMapping("/deleteAddr")
    public ResponseEntity<String> deleteAddr(@RequestParam("id") Long addressId){

        Optional<Address> address = service.selectUserAddress(addressId);
        address.get().setAddressState(AddressState.DELETED); // active에서 deleted 상태 변경

        service.updateAddressState(address.get());

        return ResponseEntity.ok("deleteAddrOk");
    }

    @GetMapping("/getSettledSellersList")
    public ResponseEntity<Map<String, Object>> getSettledSellersListWithSearch(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String keyword,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Map<String, Object> response = new HashMap<>();
        User user = interactService.selectUserByName(userDetails.getUsername());
        keyword = (keyword == null) ? "" : keyword.trim();
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Map<String, Object>> sellerPage = null;

        if((year.isEmpty() || year.equals("전체")) && (month.isEmpty() || month.equals("전체"))){
            sellerPage = orderRepository.findMonthlySettledSalesByUser(user.getId(), keyword, pageable);
        }
        else if((year.isEmpty() || year.equals("전체"))) {
            sellerPage = orderRepository.findSettledListWithTotalSalesByConditionsNoYearAndUserId(Integer.parseInt(month), keyword,user.getId(), pageable);
        }
        else if(month.isEmpty() || month.equals("전체")) {
            sellerPage = orderRepository.findSettledListWithTotalSalesByConditionsNoMonthAndUserId(Integer.parseInt(year), 0, keyword,user.getId(), pageable);
        }
        else {
            sellerPage = orderRepository.findSettledListWithTotalSalesByConditionsAndUserId(Integer.parseInt(year), Integer.parseInt(month),
                    keyword,user.getId(), pageable);
        }

        response.put("sellers", sellerPage.getContent());
        response.put("selectedCount", sellerPage.getTotalElements());
        response.put("totalPage", sellerPage.getTotalPages());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/getSellerSettledProducts")
    public Map<String, Object> settledProductList(@RequestParam String user_id,
                                                  @RequestParam(required = false) String settledYear,
                                                  @RequestParam(required = false) String settledMonth,
                                                  @RequestParam(required = false) ShippingState shippingState) {

        User user = interactService.selectUserByName(user_id);
        List<Orders> orders = new ArrayList<>();
        if (shippingState == ShippingState.SETTLED) {
            boolean settledHasYear = settledYear != null && !settledYear.isEmpty() && !settledYear.equals("전체");
            boolean settledHasMonth = settledMonth != null && !settledMonth.isEmpty() && !settledMonth.equals("전체");

            if (settledHasYear && settledHasMonth) {
                int settledParsedYear = Integer.parseInt(settledYear);
                int settledParsedMonth = Integer.parseInt(settledMonth);
                orders = orderRepository.findAllByProductSellerNoAndShippingStateAndYearAndMonth(
                        user.getId(), ShippingState.SETTLED.name(), settledParsedYear, settledParsedMonth);
            } else if (settledHasYear) {
                int settledParsedYear = Integer.parseInt(settledYear);
                orders = orderRepository.findAllByProductSellerNoAndShippingStateAndYear(
                        user.getId(), ShippingState.SETTLED.name(), settledParsedYear);
            } else if (settledHasMonth) {
                int settledParsedMonth = Integer.parseInt(settledMonth);
                orders = orderRepository.findAllByProductSellerNoAndShippingStateAndMonth(
                        user.getId(), ShippingState.SETTLED.name(), settledParsedMonth);
            } else {
                orders = orderRepository.findAllByProductSellerNoAndShippingState(user, ShippingState.SETTLED);
            }
        }
        System.out.println("정산 완료 제품 목록");
        Map<String, Object> result = new HashMap<>();
        result.put("orderList", orders);
        return result;
    }
}

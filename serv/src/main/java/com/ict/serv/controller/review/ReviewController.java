package com.ict.serv.controller.review;

import com.ict.serv.dto.ReviewResponseDto;
import com.ict.serv.entity.PointType;
import com.ict.serv.entity.UserPoint;
import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.order.ShippingState;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.review.*;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.*;
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
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/review")
public class ReviewController {
    private final ReviewService service;
    private final InteractService interactService;
    private final OrderService orderService;
    private final AuthService authService;
    private final ProductService productService;


    // 리뷰 등록
    @PostMapping("/write")
    @Transactional(rollbackFor = {RuntimeException.class, SQLException.class})
    public ResponseEntity<String> write(@AuthenticationPrincipal UserDetails userDetails, ReviewDTO reviewDTO, @RequestParam(value = "files", required = false) MultipartFile[] files){ // 파일이 없을수도 있어서 required = false 적어줌

        List<File> savedFiles = new ArrayList<>();

        Review review = new Review();

        review.setReviewContent(reviewDTO.getReviewContent());
        review.setUser(interactService.selectUserByName(userDetails.getUsername()));
        review.setRate(reviewDTO.getRate());

        Product product = new Product();
        product.setId(reviewDTO.getProductId());
        review.setProduct(product);

        try {
            Review savedReview = service.saveReview(review);
            if (files != null && files.length > 0) {
                String uploadDir = System.getProperty("user.dir") + "/uploads/review/" + savedReview.getId();
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

                    ReviewImage reviewImage = new ReviewImage();
                    reviewImage.setFilename(destFile.getName());
                    reviewImage.setSize((int) destFile.length());
                    reviewImage.setReview(savedReview);

                    savedReview.getImages().add(reviewImage);
                }

                service.saveReview(savedReview);
            }

            // point 30 추가
            User user = review.getUser();
            user.setGradePoint(user.getGradePoint()+30);
            authService.saveUser(user);

            UserPoint userPoint = new UserPoint();
            userPoint.setType(PointType.REVIEW);
            userPoint.setLastSpinDate(LocalDate.now());
            userPoint.setPoint(30);
            userPoint.setUserId(user.getId());
            interactService.saveUserPoint(userPoint);
            return ResponseEntity.ok("reviewAddOk");
        } catch (Exception e) {
            e.printStackTrace();

            for (File delFile : savedFiles) {
                delFile.delete();
            }
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly(); // 롤백
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("리뷰 등록 실패");
        }
    }

    // 내가 이 상품을 구매한 사람이 맞는지 체크 (리뷰버튼 보이기 위해)
    @GetMapping("/checkPurchase")
    public ReviewResponseDto checkPurchase(@RequestParam Long userId, @RequestParam Long productId){
        User user = new User();
        user.setId(userId);

        List<Orders> orders = orderService.selectCheckPurchase(user, productId);
        boolean orderIsOk = false;
        for(Orders order:orders) {
            if (order.getShippingState() == ShippingState.FINISH || order.getShippingState() == ShippingState.SETTLED) {
                orderIsOk = true;
                break;
            }
        }

        // 리뷰를 이미 쓴 사람인지 체크!
        Product product = new Product();
        product.setId(productId);

        boolean reviewIsOk = service.selectCheckReview(user, product);

        return new ReviewResponseDto(orderIsOk, reviewIsOk);
    }

    // 전체 리뷰 리스트
    @GetMapping("/productReviewList")
    public ResponseEntity<?> productReviewList(Long productId){
        Product product = productService.selectProduct(productId).get();

        List<Review> reviewList = service.productReviewList(product);

        float sum = 0;
        for(Review review:reviewList) {
            sum+= Float.parseFloat(review.getRate());
        }
        float average = (float) sum / reviewList.size();
        average = Math.round(average * 10f) / 10f;

        product.setRating(average);
        productService.saveProduct(product);

        if (reviewList.isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>()); // 이렇게 변경!
        }

        return ResponseEntity.ok(reviewList);
    }

    // 리뷰 좋아요
    @PostMapping("/like")
    public ResponseEntity<Map<String, Object>> like(@RequestParam("reviewId") Long reviewId, @RequestParam("userId") Long userId) {
        User user = new User();
        user.setId(userId);

        Review review = new Review();
        review.setId(reviewId);

        ReviewLike reviewLike = new ReviewLike();
        reviewLike.setUser(user);
        reviewLike.setReview(review);

        // 좋아요 저장
        ReviewLike result = service.likeInsert(reviewLike);

        // 최신 좋아요 개수 가져오기
        int updatedLikes = service.getLikeCountByReviewId(reviewId);

        boolean liked = service.isUserLikedReview(userId, reviewId); // 유저가 좋아요 했는지 확인

        // 프론트에 보낼 데이터 구성
        Map<String, Object> response = new HashMap<>();
        response.put("likes", updatedLikes);
        response.put("liked", liked);

        return ResponseEntity.ok(response);
    }

    // 리뷰 좋아요 삭제
    @PostMapping("/likeDelete")
    public int likeDelete(@RequestParam("reviewId") Long reviewId, @RequestParam("likedId") Long likedId){
        Review review = new Review();
        review.setId(reviewId);

        User user = new User();
        user.setId(likedId);

        int likeDelState = service.likeDelete(review, user);

        return likeDelState;
    }

    // 리뷰 수정
    @PostMapping("/modify/{id}")
    @Transactional(rollbackFor = {RuntimeException.class, SQLException.class})
    public ResponseEntity<String> modifyReview(@PathVariable Long id, ReviewDTO reviewModifyDTO, @RequestParam(value = "files", required = false) MultipartFile[] files) {

        // 파일을 제외한 나머지 내용 수정
        Optional<Review> selectReviewData = service.selectReviewId(id); // 수정한 데이터가 아닌 기존 데이터 가져오기
        Review review = new Review();
        review.setId(id);
        review.setRate(reviewModifyDTO.getRate());
        review.setReviewContent(reviewModifyDTO.getReviewContent());
        review.setReviewWritedate(selectReviewData.get().getReviewWritedate());
        review.setProduct(selectReviewData.get().getProduct());
        review.setUser(selectReviewData.get().getUser());

        // DB : 기존 이미지 전체 삭제
        int delReviewImage = 0;
        if(selectReviewData.isPresent()) { // 데이터가 존재하면 아래 실행 (파일을 등록하지 않았을수도있으므로)
            List<ReviewImage> reviewImages = selectReviewData.get().getImages();
            for (ReviewImage reviewImage : reviewImages) {
                delReviewImage = service.deleteReviewImage(review);
            }
        }

        // DB : update
        Review savedReview = service.saveReview(review);
        if(files!=null && files.length > 0) {

            // 삭제전 파일 임시로 백업할곳
            String backupDirPath = System.getProperty("user.dir") + "/uploads/review_backup/";
            File backupDir = new File(backupDirPath);
            if (!backupDir.exists()) backupDir.mkdir();

            // 기존 파일 위치
            String filepath = System.getProperty("user.dir") + "/uploads/review/" + id + "/";

            // 수정완료성공여부 (파일 업로드 성공 여부)
            boolean success = false;

            try {
                // 기존 파일 목록
                File folder = new File(filepath);

                // 기존 파일을 담을 객체
                List<String> existingFileNames = new ArrayList<>();
                if (folder.exists() && folder.isDirectory()) {
                    File[] existingFiles = folder.listFiles();
                    // 기존 파일이 존재하는지 확인
                    if (existingFiles != null) { // 파일이 있으면
                        for (File f : existingFiles) {
                            System.out.println("기존 파일: " + f.getName());
                            existingFileNames.add(f.getName()); // 기존파일명 저장
                        }
                    }
                }

                // 수정 파일을 담을 객체
                List<String> updatedFileNames = new ArrayList<>();
                for (MultipartFile file : files) { // 수정파일 목록
                    System.out.println("수정요청한 파일: " + file.getOriginalFilename());
                    updatedFileNames.add(file.getOriginalFilename()); // 수정파일명 저장
                }

                // 기존 파일 중, 수정 요청 목록에 없는 파일은 백업 후 삭제
                for (String existingName : existingFileNames) {
                    if (!updatedFileNames.contains(existingName)) { // 수정 요청한 파일안에 기존파일이 포함되어있지 않을때
                        File originalFile = new File(filepath + existingName); // 기존 파일

                        // 파일 삭제전 파일 백업(임시폴더에 저장했다가 모든 실행이 성공시 삭제할 예정)
                        if (originalFile.exists()) {
                            System.out.println(originalFile.getName());
                            File backupFile = new File(backupDirPath + id + "_" + existingName); //ex) 1_존재하는파일명 ---> 다른 아이디와 혼동하지않게 구분자"_"를 붙임
                            Files.copy(originalFile.toPath(), backupFile.toPath(), StandardCopyOption.REPLACE_EXISTING);  // StandardCopyOption.REPLACE_EXISTING = 파일이 이미 존재하면 덮어씌우라는 뜻

                            originalFile.delete(); // 기존 파일 삭제
                        } else {
                            System.out.println("백업 시도 실패: 파일이 존재하지 않음 → " + originalFile.getAbsolutePath());
                        }
                    }
                }

                // 수정 요청한 파일들 실제 저장
                for (MultipartFile file : files) {
                    File updateFileSave = new File(filepath + file.getOriginalFilename());
                    file.transferTo(updateFileSave);
                    //System.out.println("파일 저장 완료: " + updateFileSave.getAbsolutePath());

                    // 수정 이미지 담기
                    ReviewImage reviewImage = new ReviewImage();
                    reviewImage.setSize((int) updateFileSave.length());
                    reviewImage.setFilename(updateFileSave.getName());
                    reviewImage.setReview(savedReview);
                    savedReview.getImages().add(reviewImage);
                }

                // DB : 수정 파일들 DB 저장
                service.saveReview(savedReview);

                // 모든 파일 수정 성공 --> finally에서 백업파일삭제
                success = true;
            } catch (Exception e) {
                e.printStackTrace();

                if (delReviewImage <= 0) {
                    // 실패시 백업폴더로 복구
                    File[] backupFiles = backupDir.listFiles((dir, name) -> name.startsWith(id + "_"));
                    if (backupFiles != null) {
                        for (File bf : backupFiles) {
                            String originalName = bf.getName().replaceFirst(id + "_", "");
                            try {
                                Files.copy(bf.toPath(), Paths.get(filepath + originalName), StandardCopyOption.REPLACE_EXISTING);
                            } catch (IOException ioException) {
                                ioException.printStackTrace(); // 복구 실패도 로그 남겨줌
                            }
                        }
                    }
                }
                // 에러 발생 시 롤백(파일 자체를 롤백해주진 않아서 위에 백업파일안에 따로 관리함)
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("리뷰 수정 실패");
            } finally {
                // DB : 이미지 DB 삭제가 실패헀을때
                if (delReviewImage <= 0) {
                    System.out.println("이미지 DB 삭제 실패");
                }

                // 모든 수정이 다 성공했을때만 임시로 복사한 백업 파일 모두 삭제
                if (success) {
                    File[] backupFiles = backupDir.listFiles((dir, name) -> name.startsWith(id + "_")); // ex) "1_" 로 시작하는 파일들은 모두 삭제
                    if (backupFiles != null) {
                        for (File bf : backupFiles) {
                            bf.delete();
                        }
                    }
                }
            }
        }

        return ResponseEntity.ok("reviewModOk");
    }

    @GetMapping("/delReview")
    public ResponseEntity<String> delReview(Long userId, Long reviewId){
        Optional<Review> reviewOptional = service.selectReviewId(reviewId);
        if (reviewOptional.isPresent()) {
            Review review = reviewOptional.get();
            if (review.getUser().getId().equals(userId)) { // get으로 가져온 userId와 실제 DB상의 userId가 같으면 삭제 진행 : 한번더체크
                service.deleteReview(Optional.of(review));
                return ResponseEntity.ok("리뷰 삭제 성공");
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("실제로 리뷰를 작성한 사람이 아닙니다.");
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("리뷰를 찾을 수 없습니다.");
        }
    }

    // 리뷰의 평균 별점 구하기
    @GetMapping("/averageStar")
    public Map<String, Object> averageReview(@RequestParam("productId") Long productId){
        Product product = new Product();
        product.setId(productId);

        List<Review> reviewAverage = service.selectProductId(product);
        double total = 0;
        int count = reviewAverage.size();

        for(Review review : reviewAverage){
            total += Double.parseDouble(review.getRate());
        }

        double average = 0;
        String content = "";
        if(count>0){
            average = total / count;
            content = reviewAverage.get(0).getReviewContent();
        }

        // Map에 평균 별점과 리뷰 개수를 넣어서 반환
        Map<String, Object> response = new HashMap<>();
        response.put("average", average);
        response.put("reviewCount", count);
        response.put("reviewContent", content);
        return response;
    }

    // 내가 쓴 리뷰 전체 리스트
    @GetMapping("/myReviewList/{id}")
    public List<Review> myReviewList(@PathVariable long id){
        User user = new User();
        user.setId(id);

        List<Review> myReviewList = service.selectMyReviewList(user);

        return myReviewList;
    }

    // 각각의 상품에 대한 구매 후기 리스트
    @GetMapping("/cusReviewList")
    public ResponseEntity<List<Review>> cusReviewList(Long userNo) {
        User user = interactService.selectUser(userNo);
        System.out.println("userNo: " + userNo);
        List<Product> productList = productService.selectProductByUser(user);
        List<Review> result = new ArrayList<>();
        for(Product product:productList) {
            result.addAll(service.findByProduct(product));
        }

        return ResponseEntity.ok(result);
    }
}

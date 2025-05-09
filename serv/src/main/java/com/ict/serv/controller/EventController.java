package com.ict.serv.controller;

import com.ict.serv.entity.PointType;
import com.ict.serv.entity.UserPoint;
import com.ict.serv.entity.coupon.Coupon;
import com.ict.serv.entity.coupon.CouponState;
import com.ict.serv.entity.event.Event;
import com.ict.serv.entity.event.Melon;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.UserPointRepository;
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
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/event")
public class EventController {
    private final InteractService interactService;
    private final EventService eventService;
    private final RouletteService rouletteService;
    private final UserPointRepository userPointRepository;
    private final CouponService couponService;
    private final AuthService authService;

    @PostMapping("/write")
    @Transactional(rollbackFor = {RuntimeException.class, SQLException.class})
    public ResponseEntity<String> write(Event event, MultipartFile file, @AuthenticationPrincipal UserDetails userDetails) {
        try{
            User writer = interactService.selectUserByName(userDetails.getUsername());
            event.setUser(writer);
            String startDate = event.getStartDate();
            String endDate = event.getEndDate();

            event.setStartDate(startDate);
            event.setEndDate(endDate);

            Event savedEvent = eventService.saveEvent(event);
            String uploadDir = System.getProperty("user.dir") + "/uploads/event/" + savedEvent.getId();
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();
            String originalFilename = file.getOriginalFilename();
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
            savedEvent.setFilename(destFile.getName());

            eventService.saveEvent(savedEvent);
            return ResponseEntity.ok("이벤트 등록 성공");
        } catch (Exception e) {
            e.printStackTrace();
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("이벤트 등록 실패");
        }
    }
    @GetMapping("/getEventList")
    public List<Event> getEventList(){
        return eventService.getAllEvent();
    }

    @GetMapping("/melonRank")
    public String melonRank(@AuthenticationPrincipal UserDetails userDetails, Melon melon) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        if(couponService.selectUserPointByMelon(PointType.MELON,user).isEmpty()) {
            user.setGradePoint(user.getGradePoint()+ melon.getScore());
            UserPoint user_point = new UserPoint(user.getId(), melon.getScore(), LocalDate.now(), PointType.MELON);
            userPointRepository.save(user_point);
            authService.saveUser(user);
        }
        melon.setUser(user);
        melon.setStartDate(LocalDateTime.now());
        eventService.saveMelon(melon);
        if(!couponService.findCouponByType("melon",user).isEmpty()) return "이미 쿠폰을 지급받으셨습니다.";
        Coupon coupon = new Coupon();
        coupon.setType("melon");
        coupon.setCouponName("멜론 게임 쿠폰");
        coupon.setUser(user);
        coupon.setState(CouponState.AVAILABLE);
        coupon.setStartDate(LocalDateTime.now());
        coupon.setEndDate(LocalDateTime.now().plusYears(1));
        if(melon.getScore() >= 100) {
            coupon.setDiscount(1000);
            couponService.saveCoupon(coupon);
            return "1000원 쿠폰이 지급되었습니다.";
        }
        return "ok";
    }
    @GetMapping("/getMelonRank")
    public List<Melon> getMelonRank() {
        return eventService.getMelonList();
    }

    @GetMapping("/edit/{id}")
    public Optional<Event> edit(@PathVariable("id") Long id) {
        Optional<Event> event = eventService.selectEventInfo(id);
        return event;
    }

    @PostMapping("/editForm")
    @Transactional(rollbackFor = {RuntimeException.class, SQLException.class})
    public ResponseEntity<String> editForm(Event eventEdit, MultipartFile file, @AuthenticationPrincipal UserDetails userDetails) {

        try{
            Optional<Event> originEvent = eventService.selectEventInfo(eventEdit.getId());

            /* start : 기존 썸네일 이미지가 아닌 새로운 썸네일 이미지로 수정했을때 */
            String uploadDir = System.getProperty("user.dir") + "/uploads/event/" + eventEdit.getId();
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs(); // 폴더 없으면 만들어주기
            }
            if (file != null && !file.isEmpty()) {
                // 1. 기존 파일 삭제
                File[] existingFiles = dir.listFiles();
                if (existingFiles != null) {
                    for (File existingFile : existingFiles) {
                        if (existingFile.isFile()) {
                            existingFile.delete();
                        }
                    }
                }
                // 2. 새 파일 저장
                String savePath = uploadDir + "/" + file.getOriginalFilename();
                file.transferTo(new File(savePath));

                originEvent.get().setFilename(file.getOriginalFilename());
            }
            /* end : 기존 썸네일 이미지가 아닌 새로운 썸네일 이미지로 수정했을때 */


            originEvent.get().setEventName(eventEdit.getEventName());
            originEvent.get().setStartDate(eventEdit.getStartDate());
            originEvent.get().setEndDate(eventEdit.getEndDate());
            originEvent.get().setContent(eventEdit.getContent());
            originEvent.get().setRedirectUrl(eventEdit.getRedirectUrl());

            eventService.saveEvent(originEvent.get());

            return ResponseEntity.ok("eventEditOk");
        } catch (Exception e) {
            e.printStackTrace();
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("이벤트 수정 실패");
        }

    }

    @GetMapping("/delEvent")
    public ResponseEntity<String> delEvent(Long eventId){
        try {
            // 1. DB에서 이벤트 삭제
            eventService.delEvent(eventId);

            // 2. 파일 삭제
            String deleteDirPath = System.getProperty("user.dir") + "/uploads/event/" + eventId;
            File deleteDir = new File(deleteDirPath);

            if (deleteDir.exists() && deleteDir.isDirectory()) {
                File[] files = deleteDir.listFiles();
                if (files != null) {
                    for (File file : files) {
                        if (file.isFile()) {
                            file.delete(); // 파일 삭제
                        }
                    }
                }
                deleteDir.delete(); // 폴더 자체도 삭제 (비어있어야 삭제 가능)
            }

            return ResponseEntity.ok("delEventOk");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("delEventFail");
        }
    }

}

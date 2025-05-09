package com.ict.serv.controller;

import com.ict.serv.entity.notice.Notice;
import com.ict.serv.entity.notice.NoticeListResponseDTO;
import com.ict.serv.entity.notice.NoticeUpdateRequest;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.NoticeService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/notice")
public class NoticeController {
    private final NoticeService noticeService;
    private final InteractService interactService;

    @PostMapping("/write")
    @Transactional(rollbackFor = {RuntimeException.class})
    public ResponseEntity<String> write(Notice notice, @AuthenticationPrincipal UserDetails userDetails) {
        try{
            com.ict.serv.entity.user.User writer = interactService.selectUserByName(userDetails.getUsername());
            notice.setUser(writer);

            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            Notice savedNotice = noticeService.saveNotice(notice);

            noticeService.saveNotice(savedNotice);
            return ResponseEntity.ok("공지사항 등록 성공");
        } catch (Exception e) {
            e.printStackTrace();
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("공지사항 등록 실패");
        }
    }

    @GetMapping("/getNoticeList")
    public NoticeListResponseDTO getNoticeList(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ALL") String state
    ) {
        return noticeService.getNoticeList(keyword, page, size, state);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNoticeById(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Optional<Notice> noticeOptional = noticeService.getNoticeById(id);
            if (noticeOptional.isPresent()) {
                return ResponseEntity.ok(noticeOptional.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 ID의 공지사항을 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("공지사항 정보를 불러오는 데 실패했습니다.");
        }
    }

    @DeleteMapping("/deleteNotice/{id}")
    @Transactional(rollbackFor = {RuntimeException.class})
    public ResponseEntity<?> deleteNotice(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증이 필요합니다.");
        }
        com.ict.serv.entity.user.User currentUser = interactService.selectUserByName(userDetails.getUsername());
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("인증된 사용자를 찾을 수 없습니다.");
        }

        try {
            noticeService.deleteNotice(id, currentUser);
            return ResponseEntity.ok().body("공지사항이 성공적으로 삭제되었습니다.");
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (java.nio.file.AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("공지사항 삭제 중 오류가 발생했습니다.");
        }
    }
    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateNotice(
            @PathVariable Long id,
            @RequestBody Map<String, String> updateData,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증되지 않은 사용자입니다.");
        }
        com.ict.serv.entity.user.User currentUser = interactService.selectUserByName(userDetails.getUsername());
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("인증된 사용자를 찾을 수 없습니다.");
        }
        try {
            noticeService.updateNotice(id, updateData, userDetails.getUsername());
            return ResponseEntity.ok("공지사항 수정 완료");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("공지사항 수정 중 오류가 발생했습니다.");
        }
    }
}
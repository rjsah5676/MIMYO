package com.ict.serv.controller;


import com.ict.serv.entity.Inquiries.Inquiry;
import com.ict.serv.entity.Inquiries.InquiryPagingVO;
import com.ict.serv.entity.Inquiries.InquiryViewResponseDTO;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.UserRepository;
import com.ict.serv.service.InquiryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequestMapping("/inquiry")
@RequiredArgsConstructor
@RestController
@Slf4j
public class InquiryController {
    private final InquiryService inquiryService;
    private final UserRepository userRepository;

    @GetMapping("/inquiryView/{id}")
    public ResponseEntity<?> getInquiryView(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required.");
        String currentUsername = userDetails.getUsername();
        User currentUser = userRepository.findUserByUserid(currentUsername);
        if (currentUser == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Authenticated user not found in database.");

        try {
            InquiryViewResponseDTO inquiryDetails = inquiryService.getInquiryDetails(id, currentUser);
            return ResponseEntity.ok(inquiryDetails);
        } catch (EntityNotFoundException e) {
            log.warn("Inquiry view failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessDeniedException e) {
            log.warn("Inquiry view access denied: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error fetching inquiry view for ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching inquiry details.");
        }
    }

    @DeleteMapping("/deleteInquiry/{id}")
    public ResponseEntity<?> deleteInquiry(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required.");
        String currentUsername = userDetails.getUsername();
        User currentUser = userRepository.findUserByUserid(currentUsername);
        if (currentUser == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Authenticated user not found in database.");

        try {
            inquiryService.deleteInquiry(id, currentUser);
            return ResponseEntity.ok().body(Map.of("message", "문의가 성공적으로 삭제되었습니다."));
        } catch (EntityNotFoundException e) {
            log.warn("Inquiry deletion failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            log.warn("Inquiry deletion access denied: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            log.warn("Inquiry deletion failed due to business rule: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting inquiry for ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error","문의 삭제 중 오류가 발생했습니다."));
        }
    }

    @GetMapping("/inquiryList")
    public ResponseEntity<?> getMyInquiries(@AuthenticationPrincipal UserDetails userDetails, @ModelAttribute InquiryPagingVO vo) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required.");
        String currentUsername = userDetails.getUsername();
        User currentUser = userRepository.findUserByUserid(currentUsername);
        if (currentUser == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Authenticated user not found in database.");
        try {
            Sort sorting = Sort.unsorted(); String sortParam = vo.getSort();
            if (sortParam != null && !sortParam.isEmpty()) {
                String[] sortParams = sortParam.split(",");
                if (sortParams.length > 0) {
                    String property = sortParams[0]; Sort.Direction direction = Sort.Direction.ASC;
                    if (sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1])) { direction = Sort.Direction.DESC; }
                    try { sorting = Sort.by(direction, property); } catch (IllegalArgumentException e) { log.warn("Invalid sort property: {}", property); }
                }
            } else { sorting = Sort.by(Sort.Direction.DESC, "inquiryWritedate"); vo.setSort("inquiryWritedate,desc"); }
            int requestedPage = vo.getNowPage(); int pageSize = vo.getOnePageRecord();
            if (pageSize <= 0) { pageSize = 5; vo.setOnePageRecord(pageSize); }
            int pageIndex = Math.max(0, requestedPage - 1); PageRequest pageRequest = PageRequest.of(pageIndex, pageSize, sorting);
            List<Inquiry> inquiries = inquiryService.getInquiriesByUserList(currentUser, pageRequest); long totalItems = inquiryService.getTotalInquiryCountByUser(currentUser);
            vo.setTotalRecord((int) totalItems); int calculatedTotalPages = vo.getTotalPage(); int finalNowPage = requestedPage;
            if (totalItems == 0) { finalNowPage = 1; vo.setTotalPage(0); }
            else if (requestedPage > calculatedTotalPages) {
                if (calculatedTotalPages == 0) { calculatedTotalPages = (int) ((totalItems + pageSize - 1) / pageSize); vo.setTotalPage(calculatedTotalPages); }
                finalNowPage = calculatedTotalPages > 0 ? calculatedTotalPages : 1;
            }
            vo.setNowPage(finalNowPage);
            if (finalNowPage != requestedPage && totalItems > 0 && (finalNowPage - 1) != pageIndex) {
                log.info("Page adjusted: {}->{}. Re-fetching.", requestedPage, finalNowPage);
                pageRequest = PageRequest.of(finalNowPage - 1, pageSize, sorting);
                inquiries = inquiryService.getInquiriesByUserList(currentUser, pageRequest);
            }
            Map<String, Object> response = new HashMap<>(); response.put("inquiries", inquiries); response.put("pagingInfo", vo);
            return ResponseEntity.ok(response);
        } catch (Exception e) { log.error("Error fetching inquiries for user: {}", currentUsername, e); return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching inquiries."); }
    }

    @PostMapping("/inquiryWriteOk")
    public ResponseEntity<String> InquiryWriteOk(@RequestParam("inquiry_subject") String inquirySubject, @RequestParam("inquiry_type") String inquiryType, @RequestParam("inquiry_content") String inquiryContent, @RequestParam("user_id") Long userId, @RequestParam(value = "inquiry_image", required = false) List<MultipartFile> images) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found with ID: " + userId);
            Inquiry inquiry = new Inquiry(); inquiry.setInquirySubject(inquirySubject); inquiry.setInquiryType(inquiryType); inquiry.setInquiryContent(inquiryContent); inquiry.setUser(user); inquiry.setInquiryWritedate(LocalDateTime.now());
            Inquiry result = inquiryService.createInquiryWithImages(inquiry, images);
            if (result == null || result.getId() == null || result.getId() <= 0) return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save inquiry");
            else return ResponseEntity.ok("ok");
        } catch (Exception e) { log.error("Error creating inquiry", e); return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating inquiry: " + e.getMessage()); }
    }
    @PostMapping("/inquiryResponse")
    public ResponseEntity<?> createInquiryResponse(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인.");
        }

        Object inquiryIdObj = payload.get("inquiryId");
        Object contentObj = payload.get("content");
        String username = userDetails.getUsername();

        if (inquiryIdObj == null || contentObj == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("문의 ID(inquiryId) 또는 답변 내용(content)이 누락되었습니다.");
        }

        Long inquiryId;
        String content;
        try {
            if (inquiryIdObj instanceof Integer) {
                inquiryId = ((Integer) inquiryIdObj).longValue();
            } else if (inquiryIdObj instanceof String) {
                inquiryId = Long.parseLong((String) inquiryIdObj);
            } else if (inquiryIdObj instanceof Long) {
                inquiryId = (Long) inquiryIdObj;
            } else {
                throw new IllegalArgumentException("Invalid type for inquiryId");
            }

            if (contentObj instanceof String) {
                content = (String) contentObj;
                if (content.trim().isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("답변 내용(content)은 비어 있을 수 없습니다.");
                }
            } else {
                throw new IllegalArgumentException("Invalid type for content");
            }
        } catch (Exception e) {
            log.warn("요청 데이터 처리 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("잘못된 요청 데이터 형식입니다.");
        }

        try {
            inquiryService.addResponse(inquiryId, content, username);
            User currentUser = userRepository.findUserByUserid(username);
            if (currentUser == null) {
                log.error("Authenticated user disappeared during response processing: {}", username);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("답변은 등록되었으나 사용자 정보를 찾는 중 오류 발생.");
            }
            InquiryViewResponseDTO inquiryDetails = inquiryService.getInquiryDetails(inquiryId, currentUser);

            return ResponseEntity.ok(inquiryDetails);

        } catch (Exception e) {
            log.error("답변 처리 중 오류 발생: inquiryId={}, user={}, errorType={}, errorMessage={}",
                    inquiryId, username, e.getClass().getSimpleName(), e.getMessage(), e);

            if (e instanceof EntityNotFoundException) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("관련 데이터를 찾을 수 없습니다: " + e.getMessage());
            } else if (e instanceof IllegalStateException) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("처리할 수 없는 상태입니다: " + e.getMessage());
            } else if (e instanceof AccessDeniedException) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("접근 권한이 없습니다.");
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("답변 처리 중 오류가 발생했습니다.");
        }
    }
}
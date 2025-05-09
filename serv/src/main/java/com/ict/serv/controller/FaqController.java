package com.ict.serv.controller;

import com.ict.serv.dto.FaqDto;
import com.ict.serv.entity.Inquiries.FAQ;
import com.ict.serv.entity.Inquiries.FAQCategory;
import com.ict.serv.service.FaqService;
import com.ict.serv.service.InteractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/faq")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;
    private final InteractService interactService;

    @GetMapping
    public ResponseEntity<List<FAQ>> getAllFaqs() {
        return ResponseEntity.ok(faqService.getAllFaqs());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<FAQ>> getFaqsByCategory(@PathVariable String category) {
        try {
            FAQCategory faqCategory = FAQCategory.valueOf(category.toUpperCase());
            return ResponseEntity.ok(faqService.getFaqsByCategory(faqCategory));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/insertFaq")
    public ResponseEntity<FAQ> createFaq(@RequestBody FaqDto dto,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        FAQ createdFaq = faqService.createFaq(dto, interactService.selectUserByName(userDetails.getUsername()));
        return new ResponseEntity<>(createdFaq, HttpStatus.CREATED);
    }
    @GetMapping("/search")
    public ResponseEntity<List<FAQ>> searchFaqs(@RequestParam(value = "keyword", required = false) String keyword) {
        List<FAQ> searchResults = faqService.searchFaqs(keyword);
        return ResponseEntity.ok(searchResults);
    }
}

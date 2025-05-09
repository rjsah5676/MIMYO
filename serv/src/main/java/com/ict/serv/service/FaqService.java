package com.ict.serv.service;

import com.ict.serv.dto.FaqDto;
import com.ict.serv.entity.Inquiries.FAQ;
import com.ict.serv.entity.Inquiries.FAQCategory;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.UserRepository;
import com.ict.serv.repository.inquiry.FaqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FaqService {
    private final FaqRepository faqRepository;
    private final UserRepository userRepository;

    public List<FAQ> getAllFaqs() {
        return faqRepository.findAll();
    }

    public List<FAQ> getFaqsByCategory(FAQCategory category) {
        return faqRepository.findByCategory(category);
    }
    public List<FAQ> searchFaqs(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return getAllFaqs(); // 검색어가 없으면 전체 목록 반환 또는 빈 목록 처리
        }
        return faqRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(keyword, keyword);
    }

    @Transactional
    public FAQ createFaq(FaqDto dto, User user) {
        // 필수 입력값 체크
        if (!StringUtils.hasText(dto.getTitle())) {
            throw new IllegalArgumentException("질문을 작성해주세요");
        }
        if (!StringUtils.hasText(dto.getContent())) {
            throw new IllegalArgumentException("답변을 작성해주세요");
        }
        if (!StringUtils.hasText(dto.getCategory())) {
            throw new IllegalArgumentException("카테고리를 선택해주세요.");
        }

        // 유저 조회
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // FAQ 객체 생성 및 저장
        FAQ faq = new FAQ();
        faq.setTitle(dto.getTitle());
        faq.setContent(dto.getContent());
        faq.setCategory(FAQCategory.valueOf(dto.getCategory().toUpperCase()));
        faq.setUser(user);
        faq.setCreatedDate(LocalDateTime.now());
        faq.setModifiedDate(LocalDateTime.now());

        return faqRepository.save(faq);
    }
}

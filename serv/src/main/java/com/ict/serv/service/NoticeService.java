package com.ict.serv.service;

import com.ict.serv.entity.notice.Notice;
import com.ict.serv.entity.notice.NoticeListResponseDTO;
import com.ict.serv.entity.notice.NoticeState;
import com.ict.serv.entity.notice.NoticeUpdateRequest;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.UserRepository;
import com.ict.serv.repository.inquiry.NoticeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NoticeService {
    private final NoticeRepository repo;
    private final UserRepository userRepository;

    public Notice saveNotice(Notice notice) {
        return repo.save(notice);
    }

    public NoticeListResponseDTO getNoticeList(String keyword, int page, int size, String state) {
        int start = page * size;
        List<Notice> notices;
        int totalCount;

        if (keyword == null || keyword.isBlank()) {
            if (state.equalsIgnoreCase("ALL")) {
                notices = repo.findNoticeList(start, size);
                totalCount = repo.countAllNotices();
            } else {
                try {
                    notices = repo.findNoticeListByState(state.toUpperCase(), start, size);
                    totalCount = repo.countNoticesByState(state.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return new NoticeListResponseDTO(List.of(), 0); // 잘못된 상태 값
                }
            }
        } else {
            if (state.equalsIgnoreCase("ALL")) {
                notices = repo.findNoticeListByKeyword(keyword, start, size);
                totalCount = repo.countNoticesByKeyword(keyword);
            } else {
                try {
                    notices = repo.findNoticeListByKeywordAndState(keyword, state.toUpperCase(), start, size);
                    totalCount = repo.countNoticesByKeywordAndState(keyword, state.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return new NoticeListResponseDTO(List.of(), 0); // 잘못된 상태 값
                }
            }
        }

        return new NoticeListResponseDTO(notices, totalCount);
    }

    public Optional<Notice> getNoticeById(Long id) {
        return repo.findById(id);
    }

    public void deleteNotice(Long id, com.ict.serv.entity.user.User currentUser) throws java.nio.file.AccessDeniedException, jakarta.persistence.EntityNotFoundException {
        Optional<Notice> noticeOptional = repo.findById(id);
        if (noticeOptional.isEmpty()) {
            throw new jakarta.persistence.EntityNotFoundException("해당 공지사항을 찾을 수 없습니다.");
        }
        Notice notice = noticeOptional.get();

        if (!currentUser.getAuthority().equals("ROLE_ADMIN") && !notice.getUser().getId().equals(currentUser.getId())) {
            throw new java.nio.file.AccessDeniedException("삭제 권한이 없습니다.");
        }

        repo.delete(notice);
    }
    @Transactional
    public void updateNotice(Long id, Map<String, String> updateData, String username) throws AccessDeniedException, EntityNotFoundException, IllegalArgumentException {
        Optional<Notice> noticeOptional = repo.findById(id);
        if (noticeOptional.isEmpty()) {
            throw new EntityNotFoundException("해당 공지사항을 찾을 수 없습니다.");
        }
        Notice notice = noticeOptional.get();

        User currentUser = userRepository.findUserByUserid(username);
        if (currentUser == null) {
            throw new EntityNotFoundException("인증된 사용자를 찾을 수 없습니다.");
        }

        // 수정 권한 확인 (관리자 또는 작성자)
        if (!currentUser.getAuthority().equals("ROLE_ADMIN") && !notice.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("수정 권한이 없습니다.");
        }

        if (updateData.containsKey("noticeName")) {
            notice.setNoticeName(updateData.get("noticeName"));
        }
        if (updateData.containsKey("state")) {
            try {
                notice.setState(NoticeState.valueOf(updateData.get("state").toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("잘못된 공지 상태 값입니다: " + updateData.get("state"));
            }
        }
        if (updateData.containsKey("content")) {
            notice.setContent(updateData.get("content"));
        }
        // updateDate는 @PreUpdate 어노테이션에 의해 자동으로 업데이트됩니다.
    }
}
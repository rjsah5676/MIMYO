package com.ict.serv.service;


import com.ict.serv.entity.Authority;
import com.ict.serv.entity.Inquiries.*;
import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.MessageRepository;
import com.ict.serv.repository.UserRepository;
import com.ict.serv.repository.inquiry.InquiryImageRepository;
import com.ict.serv.repository.inquiry.InquiryRepository;
import com.ict.serv.repository.inquiry.ResponseRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final InquiryImageRepository inquiryImageRepository;
    private final ResponseRepository responseRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    @Transactional(readOnly = true)
    public InquiryViewResponseDTO getInquiryDetails(Long inquiryId, User currentUser) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new EntityNotFoundException("Inquiry not found with ID: " + inquiryId));
        boolean isAuthor = inquiry.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getAuthority() == Authority.ROLE_ADMIN;
        if (!isAuthor && !isAdmin) {
            log.warn("User {} (isAuthor={}, isAdmin={}, authority={}) attempted to access inquiry {} owned by {}. Access denied.",
                    currentUser.getUserid(),
                    isAuthor, isAdmin, currentUser.getAuthority(),
                    inquiryId, inquiry.getUser().getUserid());
            throw new AccessDeniedException("You do not have permission to view this inquiry.");
        }

        Optional<Response> responseOptional = responseRepository.findByInquiry(inquiry);

        if (inquiry.getImages() != null) {
            inquiry.getImages().size();
        }

        return new InquiryViewResponseDTO(inquiry, responseOptional.orElse(null));
    }

    @Transactional
    public void deleteInquiry(Long inquiryId, User currentUser) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new EntityNotFoundException("Inquiry not found with ID: " + inquiryId));

        if (!inquiry.getUser().getId().equals(currentUser.getId())) {
            log.warn("User {} attempted to delete inquiry {} owned by {}", currentUser.getUserid(), inquiryId, inquiry.getUser().getUserid());
            throw new AccessDeniedException("You do not have permission to delete this inquiry.");
        }

        String uploadDir = System.getProperty("user.dir") + "/uploads/inquiry/" + inquiry.getId();
        File directory = new File(uploadDir);
        if (directory.exists() && directory.isDirectory()) {
            log.info("Deleting directory and files for inquiry ID: {}", inquiryId);
            try {
                Files.walk(directory.toPath())
                        .sorted(java.util.Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(file -> {
                            if (!file.delete()) {
                                log.error("Failed to delete file/directory: {}", file.getAbsolutePath());
                            } else {
                                log.debug("Deleted: {}", file.getAbsolutePath());
                            }
                        });
            } catch (IOException e) {
                log.error("Error deleting files for inquiry ID: {}", inquiryId, e);
                throw new RuntimeException("Failed to delete inquiry files.", e);
            }
        } else {
            log.warn("Upload directory not found for inquiry ID {}, skipping file deletion.", inquiryId);
        }

        inquiryImageRepository.deleteByInquiry(inquiry);
        responseRepository.findByInquiry(inquiry).ifPresent(responseRepository::delete);
        inquiryRepository.delete(inquiry);
        log.info("Successfully deleted inquiry with ID: {}", inquiryId);
    }

    @Transactional(readOnly = true)
    public List<Inquiry> getInquiriesByUserList(User user, PageRequest pageRequest) {
        return inquiryRepository.findByUserOrderByInquiryWritedateDesc(user, pageRequest);
    }
    @Transactional(readOnly = true)
    public long getTotalInquiryCountByUser(User user) {
        return inquiryRepository.countByUser(user);
    }
    @Transactional
    public Inquiry createInquiryWithImages(Inquiry inquiry, List<MultipartFile> images) throws IOException {
        List<File> savedFiles = new ArrayList<>();
        Inquiry savedInquiry = inquiryRepository.save(inquiry);
        String uploadDir = System.getProperty("user.dir") + "/uploads/inquiry/" + savedInquiry.getId();
        File dir = new File(uploadDir);

        if (images != null && !images.isEmpty()) {
            if (!dir.exists()) { dir.mkdirs(); }
            List<InquiryImage> inquiryImages = new ArrayList<>();
            for (MultipartFile image : images) {
                if (image.isEmpty()) continue;
                String originalFilename = image.getOriginalFilename();
                if (originalFilename == null) continue;
                String baseName = originalFilename; String extension = "";
                int point = originalFilename.lastIndexOf(".");
                if (point != -1) { baseName = originalFilename.substring(0, point); extension = originalFilename.substring(point); }
                String savedFilename = originalFilename; File destFile = new File(uploadDir, savedFilename); int count = 1;
                while (destFile.exists()) { savedFilename = baseName + "(" + count + ")" + extension; destFile = new File(uploadDir, savedFilename); count++; }
                try {
                    image.transferTo(destFile); savedFiles.add(destFile);
                    InquiryImage inquiryImage = new InquiryImage();
                    inquiryImage.setFilename(savedFilename); inquiryImage.setSize((int) image.getSize()); inquiryImage.setInquiry(savedInquiry);
                    inquiryImages.add(inquiryImage);
                } catch (IOException e) { throw new IOException("Failed to save image: " + originalFilename, e); }
            }
            if (!inquiryImages.isEmpty()) { inquiryImageRepository.saveAll(inquiryImages); }
        }
        return savedInquiry;
    }
    @Transactional
    public void addResponse(Long inquiryId, String content, String responseUsername) {

        User responseUser = userRepository.findUserByUserid(responseUsername);
        if (responseUser == null) {
            throw new EntityNotFoundException("응답자 정보를 찾을 수 없습니다: " + responseUsername);
        }

        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new EntityNotFoundException("답변 대상 문의를 찾을 수 없습니다: ID " + inquiryId));

        Optional<Response> existingResponse = responseRepository.findByInquiry(inquiry);
        if (existingResponse.isPresent()) {
            throw new IllegalStateException("해당 문의에 이미 답변이 등록되어 있습니다.");
        }

        Response newResponse = new Response();
        newResponse.setResponseContent(content);
        newResponse.setInquiry(inquiry);
        newResponse.setUser(responseUser);

        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        newResponse.setResponseWritedate(now.format(formatter));

        responseRepository.save(newResponse);
        log.info("Response added for inquiry ID: {} by user: {}", inquiryId, responseUsername);

        inquiry.setInquiryStatus(InquiryState.ANSWER);
        inquiryRepository.save(inquiry);

        Message message = new Message();
        message.setUserFrom(responseUser); // 관리자
        message.setUserTo(inquiry.getUser()); // 문의 작성자
        message.setSubject("문의 답변이 등록되었습니다.");
        message.setComment("고객님이 등록한 '" + inquiry.getInquirySubject() + "' 문의에 답변이 등록되었습니다.\n"
                + "자세한 내용은 내 정보 > 문의 내역에서 확인해주세요.");
        messageRepository.save(message);
    }
    public List<Map<String, Object>> getDailyInquiryCount() {
        List<Object[]> result = inquiryRepository.findDailyInquiryCount();

        List<Map<String, Object>> response = new ArrayList<>();
        for (Object[] row : result) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0]);
            map.put("count", row[1]);
            response.add(map);
        }

        return response;
    }
}
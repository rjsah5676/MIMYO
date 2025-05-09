package com.ict.serv.repository.inquiry;

import com.ict.serv.entity.Inquiries.Inquiry;
import com.ict.serv.entity.Inquiries.InquiryImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryImageRepository extends JpaRepository<InquiryImage, Long> {
    List<InquiryImage> findByInquiry(Inquiry inquiry);

    void deleteByInquiry(Inquiry inquiry);
}

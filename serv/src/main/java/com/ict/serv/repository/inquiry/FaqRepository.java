package com.ict.serv.repository.inquiry;

import com.ict.serv.entity.Inquiries.FAQ;
import com.ict.serv.entity.Inquiries.FAQCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FaqRepository extends JpaRepository<FAQ, Long> {
    List<FAQ> findByCategory(FAQCategory category);
    List<FAQ> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(String keyword, String keyword2);

}

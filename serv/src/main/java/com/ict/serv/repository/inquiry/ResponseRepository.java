package com.ict.serv.repository.inquiry;

import com.ict.serv.entity.Inquiries.Inquiry;
import com.ict.serv.entity.Inquiries.Response;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResponseRepository extends JpaRepository<Response, Long> {
    Optional<Response> findByInquiry(Inquiry inquiry);
}

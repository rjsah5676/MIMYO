package com.ict.serv.repository.inquiry;

import com.ict.serv.entity.Inquiries.Inquiry;
import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.user.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long>, JpaSpecificationExecutor<Inquiry> {

    List<Inquiry> findByUserOrderByInquiryWritedateDesc(User currentUser, PageRequest pageRequest);

    long countByUser(User currentUser);

    @Query("""
        SELECT COUNT(i)
        FROM Inquiry i
        WHERE i.user.id = :userId
          AND FUNCTION('YEAR', i.inquiryWritedate) = :year
          AND (:month IS NULL OR FUNCTION('MONTH', i.inquiryWritedate) = :month)
    """)
    Long countByUserIdAndDate(@Param("userId") Long userId, @Param("year") int year, @Param("month") Integer month);

    @Query("SELECT FUNCTION('DATE_FORMAT', i.inquiryWritedate, '%Y-%m-%d') AS date, COUNT(i) " +
            "FROM Inquiry i " +
            "GROUP BY date " +
            "ORDER BY date ASC")
    List<Object[]> findDailyInquiryCount();
}

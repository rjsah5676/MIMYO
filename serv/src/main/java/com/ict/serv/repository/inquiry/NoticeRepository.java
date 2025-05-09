package com.ict.serv.repository.inquiry;

import com.ict.serv.entity.notice.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    @Query(value = "SELECT * FROM notice ORDER BY write_date DESC LIMIT :size OFFSET :start", nativeQuery = true)
    List<Notice> findNoticeList(@Param("start") int start, @Param("size") int size);

    @Query(value = "SELECT * FROM notice WHERE notice_name LIKE %:keyword% ORDER BY write_date DESC LIMIT :size OFFSET :start", nativeQuery = true)
    List<Notice> findNoticeListByKeyword(@Param("keyword") String keyword, @Param("start") int start, @Param("size") int size);

    @Query(value = "SELECT * FROM notice WHERE state = :state ORDER BY write_date DESC LIMIT :size OFFSET :start", nativeQuery = true)
    List<Notice> findNoticeListByState(@Param("state") String state, @Param("start") int start, @Param("size") int size);

    @Query(value = "SELECT * FROM notice WHERE notice_name LIKE %:keyword% AND state = :state ORDER BY write_date DESC LIMIT :size OFFSET :start", nativeQuery = true)
    List<Notice> findNoticeListByKeywordAndState(
            @Param("keyword") String keyword,
            @Param("state") String state,
            @Param("start") int start,
            @Param("size") int size
    );

    @Query(value = "SELECT COUNT(*) FROM notice", nativeQuery = true)
    int countAllNotices();

    @Query(value = "SELECT COUNT(*) FROM notice WHERE notice_name LIKE %:keyword%", nativeQuery = true)
    int countNoticesByKeyword(@Param("keyword") String keyword);

    @Query(value = "SELECT COUNT(*) FROM notice WHERE state = :state", nativeQuery = true)
    int countNoticesByState(@Param("state") String state);

    @Query(value = "SELECT COUNT(*) FROM notice WHERE notice_name LIKE %:keyword% AND state = :state", nativeQuery = true)
    int countNoticesByKeywordAndState(
            @Param("keyword") String keyword,
            @Param("state") String state
    );

    Optional<Notice> findById(Long id);
}
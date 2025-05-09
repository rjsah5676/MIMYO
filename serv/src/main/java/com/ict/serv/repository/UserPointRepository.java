package com.ict.serv.repository;

import com.ict.serv.entity.PointType;
import com.ict.serv.entity.UserPoint;
import com.ict.serv.entity.user.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserPointRepository extends JpaRepository<UserPoint, Long> {
    List<UserPoint> findByUserId(Long userId);
    List<UserPoint> findByUserId(Long userId, PageRequest of);
    List<UserPoint> findByTypeAndUserIdAndLastSpinDate(PointType type, Long userId, LocalDate now);

    int countIdByUserId(Long id);

    @Query("""
        SELECT p
        FROM UserPoint p
        WHERE p.userId = :userId
          AND FUNCTION('YEAR', p.lastSpinDate) = :year
          AND (:month IS NULL OR FUNCTION('MONTH', p.lastSpinDate) = :month)
        ORDER BY p.lastSpinDate ASC
    """)
    List<UserPoint> findAllByUserIdAndDate(@Param("userId") Long userId, @Param("year") int year, @Param("month") Integer month);
    List<UserPoint> findByUserIdOrderByIdDesc(Long id, PageRequest of);
}

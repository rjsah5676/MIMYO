package com.ict.serv.repository.log;

import com.ict.serv.entity.log.user.UserJoinLog;
import com.ict.serv.entity.user.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;

public interface UserJoinLogRepository extends JpaRepository<UserJoinLog, Long> {
    boolean existsByUserAndDateBetween(User user, LocalDateTime start, LocalDateTime end);

    @Query("""
        SELECT COUNT(u)
        FROM UserJoinLog u
        WHERE u.user.id = :userId
          AND FUNCTION('YEAR', u.date) = :year
          AND (:month IS NULL OR FUNCTION('MONTH', u.date) = :month)
    """)
    Long countUserAccessByYearAndMonth(
            @Param("userId") Long userId,
            @Param("year") int year,
            @Param("month") Integer month
    );
}

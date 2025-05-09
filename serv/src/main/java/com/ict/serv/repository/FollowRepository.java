package com.ict.serv.repository;

import com.ict.serv.entity.user.Follow;
import com.ict.serv.entity.user.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Integer> {
    Follow findByUserFromAndUserTo(User userFrom, User userTo);

    List<Follow> findByUserTo(User user);

    List<Follow> findByUserFrom(User user);

    @Query(value = """
        SELECT COUNT(*)
        FROM follow
        WHERE user_to = :userId
          AND YEAR(STR_TO_DATE(follow_date, '%Y-%m-%d %H:%i:%s')) = :year
          AND (:month IS NULL OR MONTH(STR_TO_DATE(follow_date, '%Y-%m-%d %H:%i:%s')) = :month)
    """, nativeQuery = true)
    Long countFollowersByUserIdAndDate(@Param("userId") Long userId, @Param("year") int year, @Param("month") Integer month);

    @Query(value = """
        SELECT COUNT(*)
        FROM follow
        WHERE user_from = :userId
          AND YEAR(STR_TO_DATE(follow_date, '%Y-%m-%d %H:%i:%s')) = :year
          AND (:month IS NULL OR MONTH(STR_TO_DATE(follow_date, '%Y-%m-%d %H:%i:%s')) = :month)
    """, nativeQuery = true)
    Long countFollowingByUserIdAndDate(@Param("userId") Long userId, @Param("year") int year, @Param("month") Integer month);
}

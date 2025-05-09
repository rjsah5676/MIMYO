package com.ict.serv.repository.log;

import com.ict.serv.entity.log.search.SearchLog;
import com.ict.serv.entity.user.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {
    @Query("SELECT s FROM SearchLog s WHERE " +
            "(:user IS NOT NULL AND s.user = :user OR :user IS NULL AND s.ip = :ip) AND " +
            "(:word IS NULL OR s.searchWord = :word) AND " +
            "(:ec IS NULL OR s.eventCategory = :ec) AND " +
            "(:tc IS NULL OR s.targetCategory = :tc) AND " +
            "(:pc IS NULL OR s.productCategory = :pc) AND " +
            "s.searchTime > :timeLimit")
    Optional<SearchLog> findRecentDuplicate(User user, String ip, String word,
                                            String ec, String tc, String pc,


                                            LocalDateTime timeLimit);
    @Query("""
    SELECT sl.searchWord, COUNT(sl.searchWord) as cnt 
    FROM SearchLog sl
    WHERE sl.searchTime >= :since
          AND sl.searchWord IS NOT NULL AND sl.searchWord <> ''
    GROUP BY sl.searchWord
    ORDER BY cnt DESC
    """)
    List<Object[]> findTopKeywords(@Param("since") LocalDateTime since, Pageable pageable);

    @Query(value = """
    SELECT search_word
    FROM (
        SELECT search_word, MAX(search_time) AS latest_time
        FROM search_log
        WHERE user_id = :userId AND state = 'ACTIVE'
        GROUP BY search_word
    ) AS grouped
    ORDER BY latest_time DESC
    LIMIT 5
    """, nativeQuery = true)
    List<String> findDistinctTop5SearchWordsByUserId(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("UPDATE SearchLog s SET s.state = 'DELETED' WHERE s.user = :user AND s.searchWord = :searchWord")
    void softDeleteByUserAndSearchWord(@Param("user") User user, @Param("searchWord") String searchWord);

    @Modifying
    @Transactional
    @Query("UPDATE SearchLog s SET s.state = 'DELETED' WHERE s.user = :user")
    void softDeleteAllByUser(@Param("user") User user);

    List<SearchLog> findAllByUser(User user);


    @Query("""
        SELECT sl.searchWord, COUNT(sl.searchWord)
        FROM SearchLog sl
        WHERE sl.user.id = :userId
          AND FUNCTION('YEAR', sl.searchTime) = :year
          AND (:month IS NULL OR FUNCTION('MONTH', sl.searchTime) = :month)
          AND sl.searchWord IS NOT NULL
          AND sl.searchWord <> ''
        GROUP BY sl.searchWord
        ORDER BY COUNT(sl.searchWord) DESC
    """)
    List<Object[]> findTopKeywordsByUserIdAndDate(@Param("userId") Long userId, @Param("year") int year, @Param("month") Integer month, Pageable pageable);

    @Query("""
    SELECT sl.eventCategory, COUNT(sl.eventCategory)
    FROM SearchLog sl
    WHERE sl.user.id = :userId
      AND FUNCTION('YEAR', sl.searchTime) = :year
      AND (:month IS NULL OR FUNCTION('MONTH', sl.searchTime) = :month)
      AND sl.eventCategory IS NOT NULL
      AND sl.eventCategory <> ''
    GROUP BY sl.eventCategory
    """)
    List<Object[]> findCategorySearchCountsByUserIdAndDate(@Param("userId") Long userId, @Param("year") int year, @Param("month") Integer month);

}

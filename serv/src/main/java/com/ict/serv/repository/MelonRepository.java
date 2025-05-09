package com.ict.serv.repository;

import com.ict.serv.entity.event.Melon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;


public interface MelonRepository extends JpaRepository<Melon, Long> {
    @Query("SELECT m FROM Melon m WHERE DATE(m.startDate) = CURRENT_DATE ORDER BY m.score DESC")
    List<Melon> findByTodayOrderByScoreDesc();
}

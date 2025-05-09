package com.ict.serv.repository;

import com.ict.serv.entity.event.Event;
import com.ict.serv.entity.settlement.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByStartDateAsc();
}

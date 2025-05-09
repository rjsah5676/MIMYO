package com.ict.serv.service;

import com.ict.serv.entity.event.Event;
import com.ict.serv.entity.event.Melon;
import com.ict.serv.repository.EventRepository;
import com.ict.serv.repository.MelonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository repo;
    private final MelonRepository melonRepository;

    public Event saveEvent(Event event) {
        return repo.save(event);
    }

    public List<Event> getAllEvent() {
        return repo.findAllByOrderByStartDateAsc();
    }

    public Melon saveMelon(Melon melon) {
        return melonRepository.save(melon);
    }

    public List<Melon> getMelonList(){
        return melonRepository.findByTodayOrderByScoreDesc();
    }

    public Optional<Event> selectEventInfo(Long id) {
        return repo.findById(id);
    }

    public void delEvent(Long eventId) {
        repo.deleteById(eventId);
    }
}

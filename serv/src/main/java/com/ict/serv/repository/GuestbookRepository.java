package com.ict.serv.repository;

import com.ict.serv.entity.user.Guestbook;
import com.ict.serv.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuestbookRepository extends JpaRepository<Guestbook, Integer> {
    List<Guestbook> findAllByReceiverAndOriginalIdOrderByWritedateDesc(User receiver, int originalId);

    List<Guestbook> findAllByOriginalId(int id);
}

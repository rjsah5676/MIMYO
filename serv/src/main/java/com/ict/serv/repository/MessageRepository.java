package com.ict.serv.repository;

import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllByUserTo(User user);
    Message findMessageById(Long id);

    List<Message> findAllByUserToOrderByIdDesc(User user);
}

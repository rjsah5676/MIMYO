package com.ict.serv.repository.chat;

import com.ict.serv.entity.chat.ChatMessage;
import com.ict.serv.entity.chat.ChatRoom;
import com.ict.serv.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRoomOrderBySendTimeAsc(ChatRoom room);

    List<ChatMessage> findByRoomAndSenderNotAndIsReadFalse(ChatRoom room, User user);

    int countByReceiverAndIsReadFalse(User user);
}

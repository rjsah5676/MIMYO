package com.ict.serv.repository.chat;

import com.ict.serv.entity.chat.ChatRoom;
import com.ict.serv.entity.chat.ChatState;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {

    @Query("SELECT r FROM ChatRoom r " +
            "WHERE (r.participantA = :user OR r.participantB = :user) " +
            "AND r.state IN :states " +
            "AND r.product.id IS NULL " +
            "ORDER BY r.lastChat.sendTime DESC")
    List<ChatRoom> findChatRoomsWithoutProduct(@Param("user") User user,
                                               @Param("states") List<ChatState> states);

    @Query("SELECT r FROM ChatRoom r " +
            "WHERE (r.participantA = :user OR r.participantB = :user) " +
            "AND r.state IN :state " +
            "AND r.product.id IS NOT NULL " +
            "ORDER BY r.lastChat.sendTime DESC")
    List<ChatRoom> findChatRoomsWithProduct(@Param("user") User user,
                                            @Param("state") List<ChatState> states);

    @Modifying
    @Transactional
    @Query("UPDATE ChatRoom c SET c.state = 'LEFT' WHERE c.chatRoomId = :roomId")
    void updateChatRoomStateToLeft(@Param("roomId") String roomId);

    @Modifying
    @Transactional
    @Query("UPDATE ChatRoom c SET c.firstLeftUser = :userNo WHERE c.chatRoomId = :roomId")
    void updateFirstLeftUser(@Param("roomId") String roomId, Long userNo);

    @Modifying
    @Transactional
    @Query("UPDATE ChatRoom c SET c.state = 'CLOSED' WHERE c.chatRoomId = :roomId")
    void updateChatRoomStateToClosed(@Param("roomId") String roomId);

    ChatRoom findByParticipantAAndParticipantBAndProductIdAndState(User user1, User user2, Long productId, ChatState state);
}

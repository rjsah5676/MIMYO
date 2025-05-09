package com.ict.serv.service;

import com.ict.serv.dto.UserResponseDto;
import com.ict.serv.entity.chat.ChatDTO;
import com.ict.serv.entity.chat.ChatMessage;
import com.ict.serv.entity.chat.ChatRoom;
import com.ict.serv.entity.chat.ChatState;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.UserRepository;
import com.ict.serv.repository.chat.ChatRepository;
import com.ict.serv.repository.chat.ChatRoomRepository;
import com.ict.serv.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRepository chatRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ProductRepository productRepository;

    public String createRoom(User user1, User user2, Long productId) {
        String roomId = UUID.randomUUID().toString();

        ChatRoom room = ChatRoom.builder()
                .chatRoomId(roomId)
                .state(ChatState.OPEN)
                .participantA(user1)
                .participantB(user2)
                .createdAt(LocalDateTime.now())
                .build();

        if (productId != null) {
            room.setProduct(productRepository.getReferenceById(productId));
        }
        chatRoomRepository.save(room);

        return roomId;
    }

    public ChatMessage saveChat(String roomId, User user, String message) {
        ChatRoom room =  getChatRoom(roomId).get();

        User user1 = room.getParticipantA();
        User user2 = room.getParticipantB();

        System.out.println(user1.getId());
        System.out.println(user2.getId());

        ChatMessage chat = ChatMessage.builder()
                .room(room)
                .message(message)
                .sendTime(LocalDateTime.now())
                .build();

        if (user.getId().equals(user1.getId())) {
            chat.setSender(user1);
            chat.setReceiver(user2);
        } else if (user.getId().equals(user2.getId())) {
            chat.setSender(user2);
            chat.setReceiver(user1);
        } else {
            System.out.println("채팅 사용자 불일치");
        }

        chat = chatRepository.save(chat);

        room.setLastChat(chat);
        room.setState(ChatState.ACTIVE);
        chatRoomRepository.save(room);

        return chat;
    }

    public Optional<ChatRoom> getChatRoom(String roomId) {
        return chatRoomRepository.findById(roomId);
    }

    public List<ChatDTO> getChatList(String roomId) {
        ChatRoom room = getChatRoom(roomId).orElseThrow();
        List<ChatMessage> messages = chatRepository.findByRoomOrderBySendTimeAsc(room);

        return messages.stream().map(chat -> {
            User sender = chat.getSender();
            UserResponseDto urd = new UserResponseDto();
            urd.setId(sender.getId());
            urd.setUserid(sender.getUserid());
            urd.setUsername(sender.getUsername());
            urd.setImgUrl(sender.getProfileImageUrl());

            ChatDTO dto = new ChatDTO();
            dto.setId(chat.getId());
            dto.setRoomId(roomId);
            dto.setMessage(chat.getMessage());
            dto.setRead(chat.isRead());
            dto.setSendTime(chat.getSendTime());
            dto.setUrd(urd);

            dto.setImageUrls(
                    chat.getImages().stream()
                            .map(img -> "/uploads/chat/" + chat.getId() + "/" + img.getFilename())
                            .collect(Collectors.toList())
            );

            return dto;
        }).collect(Collectors.toList());
    }

    public ChatRoom findRoom(User user1, User user2, Long productId) {
        return chatRoomRepository.findByParticipantAAndParticipantBAndProductIdAndState(user1, user2, productId, ChatState.ACTIVE);
    }

    public List<ChatRoom> getChatRoomList(User user) {
        return chatRoomRepository.findChatRoomsWithoutProduct(user, List.of(ChatState.ACTIVE, ChatState.LEFT));
    }

    public List<ChatRoom> getProductChatRoomList(User user) {
        return chatRoomRepository.findChatRoomsWithProduct(user, List.of(ChatState.ACTIVE, ChatState.LEFT));
    }

    public void markChatAsRead(Long id, User user) {
        ChatMessage message = chatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("메시지 없음"));

        if (!message.getSender().equals(user)) {
            message.setRead(true);
            chatRepository.save(message);
        }
    }
    @Transactional
    public void markAllAsRead(String roomId, User user) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방 없음"));

        // user가 보낸 게 아닌, 즉 user가 "받은 메시지" 중 isRead == false
        List<ChatMessage> unreadMessages = chatRepository
                .findByRoomAndSenderNotAndIsReadFalse(room, user);

        for (ChatMessage msg : unreadMessages) {
            msg.setRead(true);
        }

        chatRepository.saveAll(unreadMessages);
    }

    public void leaveChatRoom(String roomId, Long userId) {
        ChatRoom room = getChatRoom(roomId).get();
        if (room.getState().equals(ChatState.ACTIVE)) {
            chatRoomRepository.updateChatRoomStateToLeft(roomId);
            chatRoomRepository.updateFirstLeftUser(roomId, userId);
        } else if (room.getState().equals(ChatState.OPEN) || room.getState().equals(ChatState.LEFT)) {
            chatRoomRepository.updateChatRoomStateToClosed(roomId);
        }
    }

    public int getUnreadChatCount(User user) {
        return chatRepository.countByReceiverAndIsReadFalse(user);
    }
}

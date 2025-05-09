package com.ict.serv.controller.chat;

import com.ict.serv.dto.UserResponseDto;
import com.ict.serv.entity.chat.ChatDTO;
import com.ict.serv.entity.chat.ChatMessage;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.chat.ChatRepository;
import com.ict.serv.service.ChatService;
import com.ict.serv.service.InteractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@RequiredArgsConstructor
@Controller
public class ChatWebSocketController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final InteractService interactService;
    private final ChatRepository chatRepository;
    @MessageMapping("/chat/{roomId}")
    public void handleChat(@DestinationVariable String roomId, @Payload ChatDTO chat) {
        User user = interactService.selectUserByName(chat.getUrd().getUserid());
        ChatMessage saved = null;
        if(!chat.getMessage().isEmpty()) saved = chatService.saveChat(chat.getRoomId(), user, chat.getMessage());
        else saved = chatRepository.findById(chat.getId()).orElseThrow();
        ChatDTO response = new ChatDTO();
        response.setId(saved.getId());
        response.setRoomId(chat.getRoomId());
        response.setMessage(saved.getMessage());
        response.setSendTime(saved.getSendTime());
        response.setRead(saved.isRead());

        UserResponseDto urd = new UserResponseDto();
        urd.setId(user.getId());
        urd.setUserid(user.getUserid());
        urd.setUsername(user.getUsername());
        urd.setImgUrl(user.getProfileImageUrl());
        response.setUrd(urd);

        messagingTemplate.convertAndSend("/topic/chat/" + roomId, response);
    }

    @MessageMapping("/chat/read/{roomId}")
    public void handleRead(@DestinationVariable String roomId, @Payload ChatDTO chat) {
        User user = interactService.selectUserByName(chat.getUrd().getUserid());
        ChatDTO response = new ChatDTO();
        response.setRoomId(chat.getRoomId());
        response.setId(chat.getId());

        UserResponseDto urd = new UserResponseDto();
        urd.setId(user.getId());
        urd.setUserid(user.getUserid());
        urd.setUsername(user.getUsername());
        urd.setImgUrl(user.getProfileImageUrl());
        response.setUrd(urd);

        messagingTemplate.convertAndSend("/topic/chat/read/" + roomId, response);
    }
}

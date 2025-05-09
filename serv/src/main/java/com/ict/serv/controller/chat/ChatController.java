package com.ict.serv.controller.chat;

import com.ict.serv.entity.chat.*;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.chat.ChatRepository;
import com.ict.serv.repository.chat.ChatRoomRepository;
import com.ict.serv.service.ChatService;
import com.ict.serv.service.InteractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {
    private final ChatService chatService;
    private final InteractService interactService;
    private final ChatRepository chatRepository;
    private final ChatRoomRepository chatRoomRepository;

    @GetMapping("/createChatRoom")
    public String createChatRoom(@AuthenticationPrincipal UserDetails userDetails, Long userId, Long productId) {
        User creater = interactService.selectUserByName(userDetails.getUsername());
        User target = interactService.selectUser(userId);
        ChatRoom room1 = chatService.findRoom(creater, target, productId);
        ChatRoom room2 = chatService.findRoom(target, creater, productId);

        if (room1 != null && room1.getState() != ChatState.CLOSED) return room1.getChatRoomId();
        else if (room2 != null && room2.getState() != ChatState.CLOSED) return room2.getChatRoomId();
        else return chatService.createRoom(creater, target, productId);
    }

    @GetMapping("/getChatRoom/{roomId}")
    public ResponseEntity<ChatRoom> getChatRoom(@PathVariable String roomId){
        return ResponseEntity.ok(chatService.getChatRoom(roomId).get());
    }

    @GetMapping("/chatRoomList")
    public ResponseEntity<List<ChatRoom>> chatRoomList(@AuthenticationPrincipal UserDetails userDetails, String tab) {
        User user = interactService.selectUserByName(userDetails.getUsername());

        if (tab.equals("default")) return ResponseEntity.ok(chatService.getChatRoomList(user));
        else return ResponseEntity.ok(chatService.getProductChatRoomList(user));
    }

    @GetMapping("/getChatList/{roomId}")
    public ResponseEntity<List<ChatDTO>> getChatList(@PathVariable String roomId) {
        return ResponseEntity.ok(chatService.getChatList(roomId));
    }

    @PostMapping("/read/{id}")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = interactService.selectUserByName(userDetails.getUsername());

        chatService.markChatAsRead(id, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read/room/{roomId}")
    public ResponseEntity<?> markRoomMessagesAsRead(
            @PathVariable String roomId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = interactService.selectUserByName(userDetails.getUsername());
        chatService.markAllAsRead(roomId, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/leaveChatRoom/{roomId}")
    public ResponseEntity<?> leaveChatRoom(@PathVariable String roomId,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        chatService.leaveChatRoom(roomId, user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unreadChatCount")
    public int unreadChatCount(@AuthenticationPrincipal UserDetails userDetails) {
        User user = interactService.selectUserByName(userDetails.getUsername());
        return chatService.getUnreadChatCount(user);
    }

    @PostMapping("/uploadImages")
    @Transactional
    public ResponseEntity<Map<String,Object>> uploadChatImages(@RequestParam("roomId") String roomId,
                                                         @RequestParam("files") MultipartFile[] files,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = interactService.selectUserByName(userDetails.getUsername());
            ChatRoom room = chatService.getChatRoom(roomId).orElseThrow();

            User user1 = room.getParticipantA();
            User user2 = room.getParticipantB();

            ChatMessage message = new ChatMessage();
            if (user.getId().equals(user1.getId())) {
                message.setSender(user1);
                message.setReceiver(user2);
            } else if (user.getId().equals(user2.getId())) {
                message.setSender(user2);
                message.setReceiver(user1);
            } else {
                System.out.println("채팅 사용자 불일치");
            }
            message.setRoom(room);
            message.setSendTime(LocalDateTime.now());
            message.setMessage("");
            message.setImages(new ArrayList<>());
            chatRepository.save(message);

            List<String> urls = new ArrayList<>();
            String basePath = "/uploads/chat/" + message.getId();
            File dir = new File(System.getProperty("user.dir") + basePath);
            if (!dir.exists()) dir.mkdirs();

            for (MultipartFile file : files) {
                String name = UUID.randomUUID() + "_" + file.getOriginalFilename();
                File dest = new File(dir, name);
                file.transferTo(dest);

                ChatImage img = new ChatImage();
                img.setFilename(name);
                img.setSize((int) dest.length());
                img.setChatMessage(message);
                message.getImages().add(img);
                urls.add(basePath + "/" + name);
            }

            ChatMessage savedMessage = chatRepository.save(message);
            Map<String, Object> result = new HashMap<>();
            result.put("chatId", message.getId());
            result.put("imageUrls", urls);
            room.setState(ChatState.ACTIVE);
            room.setLastChat(savedMessage);
            chatRoomRepository.save(room);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
}

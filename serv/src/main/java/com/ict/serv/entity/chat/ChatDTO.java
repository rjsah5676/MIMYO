package com.ict.serv.entity.chat;

import com.ict.serv.dto.UserResponseDto;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ChatDTO {
    private Long id;
    private String roomId;
    private String message;
    private boolean isRead;
    UserResponseDto urd;
    private LocalDateTime sendTime;
    private List<String> imageUrls;
}

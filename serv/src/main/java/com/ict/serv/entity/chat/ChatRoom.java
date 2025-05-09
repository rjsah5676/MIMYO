package com.ict.serv.entity.chat;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    @Id
    private String chatRoomId;

    @Enumerated(EnumType.STRING)
    private ChatState state;

    @ManyToOne
    @JoinColumn(name="product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name="participant_a")
    private User participantA;

    @ManyToOne
    @JoinColumn(name="participant_b")
    private User participantB;

    @Column(name = "first_left_user")
    private Long firstLeftUser;

    private LocalDateTime createdAt;

    @OneToOne
    @JsonManagedReference
    @JoinColumn(name = "last_chat_id")
    private ChatMessage lastChat;
}

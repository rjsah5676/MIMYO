package com.ict.serv.entity.chat;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ict.serv.entity.product.ProductImage;
import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="sender")
    private User sender;

    @ManyToOne
    @JoinColumn(name="receiver")
    private User receiver;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String message;

    private LocalDateTime sendTime;

    @Column(name = "is_read")
    private boolean isRead = false;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "room_id")
    private ChatRoom room;

    @OneToMany(mappedBy = "chatMessage", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ChatImage> images = new ArrayList<>();
}

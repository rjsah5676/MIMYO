package com.ict.serv.entity.chat;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name ="CHAT_IMAGE")
public class ChatImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="CHAT_IMAGE_NO")
    private Long id;

    @Column(nullable = false)
    private String filename;

    private int size;

    @ManyToOne
    @JoinColumn(name="CHAT_ID")
    @OnDelete(action= OnDeleteAction.CASCADE)
    @JsonBackReference
    private ChatMessage chatMessage;
}

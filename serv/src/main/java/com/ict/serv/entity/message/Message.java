package com.ict.serv.entity.message;

import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name ="MESSAGE")
public class Message {
    @Id
    @Column(name = "message_no")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "from_no")
    private User userFrom;

    @ManyToOne
    @JoinColumn(name = "to_no")
    private User userTo;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MessageState state = MessageState.READABLE;

    @CreationTimestamp
    @Column(columnDefinition = "DATETIME default now()")
    private String writedate;

    private String subject;

    private String comment;
}

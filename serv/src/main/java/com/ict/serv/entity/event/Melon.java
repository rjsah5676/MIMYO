package com.ict.serv.entity.event;

import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
public class Melon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    private int score;

    @Column(name="start_date", columnDefinition = "DATETIME default now()")
    private LocalDateTime startDate;
}

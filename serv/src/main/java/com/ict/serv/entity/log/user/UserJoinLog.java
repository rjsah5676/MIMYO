package com.ict.serv.entity.log.user;

import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name="USER_JOIN_LOG")
@NoArgsConstructor
public class UserJoinLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    private LocalDateTime date;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;
}

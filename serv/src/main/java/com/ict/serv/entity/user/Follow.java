package com.ict.serv.entity.user;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Data
@NoArgsConstructor
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="follow_id")
    private int id;

    @ManyToOne
    @JoinColumn(name="user_from")
    private User userFrom;

    @ManyToOne
    @JoinColumn(name="user_to")
    private User userTo;

    @CreationTimestamp
    @Column(name="follow_date",columnDefinition = "DATETIME DEFAULT NOW()")
    private String followDate;
}

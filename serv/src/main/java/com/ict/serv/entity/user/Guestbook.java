package com.ict.serv.entity.user;

import com.ict.serv.dto.UserResponseDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Guestbook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name="original_id")
    private int originalId;

    @ManyToOne
    @JoinColumn(name="writer_no", nullable = false)
    private User writer;

    @ManyToOne
    @JoinColumn(name="receiver_no")
    private User receiver;

    @Column(nullable = false)
    private String content;

    @CreationTimestamp
    @Column(columnDefinition="DATETIME default now()")
    private String writedate;
}
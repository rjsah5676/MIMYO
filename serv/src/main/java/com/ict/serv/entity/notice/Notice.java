package com.ict.serv.entity.notice;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Notice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="NOTICE_ID")
    private Long id;

    @Column(name="notice_name")
    private String noticeName;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    NoticeState state;

    @CreatedDate
    @Column(name="write_date", columnDefinition = "DATETIME")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime writeDate;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;
}

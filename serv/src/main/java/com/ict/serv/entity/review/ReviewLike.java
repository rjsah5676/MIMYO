package com.ict.serv.entity.review;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
@Table(name="REVIEW_LIKE")
public class ReviewLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="REVIEW_LIKE_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "REVIEW_ID", nullable = false)
    @JsonBackReference
    private Review review;

    @ManyToOne
    @JoinColumn(name="USER_ID", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(columnDefinition = "DATETIME default now()", name="LIKE_WRITEDATE", nullable = false)
    private String likeWritedate;
}

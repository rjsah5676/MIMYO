package com.ict.serv.entity.log.search;

import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name="SEARCH_LOG")
@Data
@NoArgsConstructor
public class SearchLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    private String ip;

    @Column(name="event_category")
    private String eventCategory;

    @Column(name="target_category")
    private String targetCategory;

    @Column(name="product_category")
    private String productCategory;

    @Column(name="search_word")
    private String searchWord;

    @CreationTimestamp
    @Column(name = "search_time")
    private LocalDateTime searchTime;

    @Enumerated(EnumType.STRING)
    private SearchState state;
}

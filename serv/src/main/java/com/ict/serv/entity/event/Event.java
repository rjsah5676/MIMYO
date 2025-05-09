package com.ict.serv.entity.event;

import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name ="EVENT")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="EVENT_ID")
    private Long id;

    @Column(name="start_date", columnDefinition = "DATETIME")
    private String startDate;  // LocalDateTime으로 변경

    @Column(name="end_date", columnDefinition = "DATETIME")
    private String endDate;

    @Column(name="event_name")
    private String eventName;

    private String filename;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    EventState state;

    @Column(name="redirect_url")
    private String redirectUrl;

    @ManyToOne
    @JoinColumn(name="seller_no")
    private User user;
}

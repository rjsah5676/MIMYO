package com.ict.serv.entity.Inquiries;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name="RESPONSE")
public class Response {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="response_no")
    private Long id;

    @Column(name="response_content", columnDefinition = "LONGTEXT")
    private String responseContent;

    @Column(name="response_writedate", columnDefinition = "DATETIME")
    private String responseWritedate;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name="inquiry_no")
    @JsonBackReference
    private Inquiry inquiry;
}

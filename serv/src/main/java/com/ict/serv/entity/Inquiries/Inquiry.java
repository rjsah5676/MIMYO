package com.ict.serv.entity.Inquiries;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ict.serv.entity.product.ProductImage;
import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor
@Data
@AllArgsConstructor
@Table(name="INQUIRIES")
public class Inquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="inquiry_no")
    private Long id;

    @Column(name="inquiry_subject")
    private String inquirySubject;

    @Column(name="inquiry_type")
    private String inquiryType;

    @Column(name="inquiry_content", columnDefinition = "LONGTEXT")
    private String inquiryContent;

    @Column(name="inquiry_writedate", columnDefinition = "DATETIME")
    private LocalDateTime inquiryWritedate;

    @Column(name="inquiry_status")
    @Enumerated(EnumType.STRING)
    private InquiryState inquiryStatus = InquiryState.NOANSWER;

    @Column(name="inquiry_enddate", columnDefinition = "DATETIME")
    private LocalDateTime inquiryEnddate; // 문의완료날짜

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    @OneToMany(mappedBy = "inquiry", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<InquiryImage> images = new ArrayList<>();

    @OneToOne(mappedBy = "inquiry", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference
    private Response response;
}

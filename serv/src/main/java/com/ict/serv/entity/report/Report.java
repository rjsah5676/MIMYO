package com.ict.serv.entity.report;

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
@Table(name ="REPORT")
public class Report {
    @Id
    @Column(name = "report_no")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "report_user_no")
    private User reportUser;

    @ManyToOne
    @JoinColumn(name = "report_user_from")
    private User userFrom;

    @Column(name = "report_status")
    @Enumerated(EnumType.STRING)
    private ReportState state = ReportState.READABLE;

    @Column(name = "report_type")
    private String reportType;

    @Column(name="sort")
    @Enumerated(EnumType.STRING)
    private ReportSort sort;

    @Column(name="sort_id")
    private Long sortId;

    private String comment;

    @CreationTimestamp
    @Column(columnDefinition = "DATETIME default now()")
    private String createDate;

    @Column(columnDefinition = "DATETIME")
    private String endDate;

    @Column(name = "report_text", length = 500)
    private String reportText;

    @Column(name = "report_result")
    private String reportResult;
}
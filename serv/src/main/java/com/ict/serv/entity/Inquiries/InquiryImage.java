package com.ict.serv.entity.Inquiries;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "INQUIRY_IMAGE")
public class InquiryImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="Inquiry_Image_No")
    private Long id;

    @Column(nullable = false)
    private String filename;

    private int size;

    @ManyToOne
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonBackReference
    @JoinColumn(name="inquiry_no")
    private Inquiry inquiry;
}

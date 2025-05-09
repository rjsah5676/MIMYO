package com.ict.serv.entity.user;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.checkerframework.checker.units.qual.C;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "addresses")
@Entity
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action= OnDeleteAction.CASCADE)
    @JsonBackReference
    private User user;

    @Column(name="recipient_name",nullable = false)
    private String recipientName;

    @Column(nullable = false)
    private String address;

    @Column(name="address_detail")
    private String addressDetail;

    @Column(nullable = false)
    private String zipcode;

    @Column(nullable = false)
    private String tel;

    @CreatedDate
    @Column(name="create_date", updatable = false, nullable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    @Column(name="modified_date")
    private LocalDateTime modifiedDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    AddressType addressType = AddressType.HOME;

    @Column(name="address_state")
    @Enumerated(EnumType.STRING)
    AddressState addressState = AddressState.ACTIVE;

}

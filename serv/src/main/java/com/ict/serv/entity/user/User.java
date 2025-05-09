package com.ict.serv.entity.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ict.serv.entity.Authority;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
@Entity
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id", unique = true)
    private String userid;

    @Column(name="user_name")
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name="user_pw")
    @JsonIgnore
    private String userpw;

    private String tel;

    private String address;

    @Column(name="address_detail")
    private String addressDetail;

    private String zipcode;

    @Column(name="info_text")
    private String infoText;

    @Column
    @Enumerated(EnumType.STRING)
    private Authority authority;

    @Column(name="kakao_profile_url")
    private String kakaoProfileUrl;

    @Column(name="uploaded_profile_url")
    private String uploadedProfileUrl;

    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime modifiedDate;

    @Column(columnDefinition = "int default 0")
    private int grade;

    @Column(name="grade_point", columnDefinition = "int default 0")
    private int gradePoint;

    @OneToMany(mappedBy = "address", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<Address> addressList = new ArrayList<>();

    public String getProfileImageUrl() {
        return (uploadedProfileUrl != null && !uploadedProfileUrl.trim().isEmpty())
                ? uploadedProfileUrl.trim()
                : (kakaoProfileUrl != null ? kakaoProfileUrl.trim() : null);
    }
}
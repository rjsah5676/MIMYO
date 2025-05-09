package com.ict.serv.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private int point;

    private LocalDate lastSpinDate;

    @Enumerated(EnumType.STRING)
    private PointType type;

    public UserPoint(Long userId, int point, LocalDate lastSpinDate, PointType type) {
        this.userId = userId;
        this.point = point;
        this.lastSpinDate = lastSpinDate;
        this.type = type;
    }
}
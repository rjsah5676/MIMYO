package com.ict.serv.entity.submenu;

import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name ="SUBMENU")
public class SubMenu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="SUBMENU_ID")
    private int id;

    @Column(name="start_date", columnDefinition = "DATETIME")
    private String startDate;

    @Column(name="end_date", columnDefinition = "DATETIME")
    private String endDate;

    @Column(name="SUBMENU_NAME")
    private String subMenuName;

    private String filename;

    @Column(columnDefinition = "LONGTEXT")
    private String subMenuCategory;
}

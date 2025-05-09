package com.ict.serv.repository;

import com.ict.serv.entity.submenu.SubMenu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubMenuRepository extends JpaRepository<SubMenu, Long> {
    List<SubMenu> findAllByOrderByStartDateDesc();
}


package com.ict.serv.service;

import com.ict.serv.entity.submenu.SubMenu;
import com.ict.serv.repository.SubMenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubMenuService {
    private final SubMenuRepository repo;
    public SubMenu saveSubMenu(SubMenu submenu) {
        return repo.save(submenu);
    }

    public List<SubMenu> getAllSubMenu() {
        return repo.findAllByOrderByStartDateDesc();
    }

    public Optional<SubMenu> getSubMenuById(Long id) {
        return repo.findById(id);
    }

    public void deleteSubMenu(Long id) {
        repo.deleteById(id);
    }
}

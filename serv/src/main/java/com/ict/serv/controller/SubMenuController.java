package com.ict.serv.controller;

import com.ict.serv.entity.submenu.SubMenu;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.SubMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/submenu")
public class SubMenuController {
    private final InteractService interactService;
    private final SubMenuService submenuService;

    @PostMapping("/write")
    @Transactional(rollbackFor = {RuntimeException.class, SQLException.class})
    public ResponseEntity<String> write(SubMenu submenu, MultipartFile file) {
        try{
            String startDate = submenu.getStartDate();
            String endDate = submenu.getEndDate();

            submenu.setStartDate(startDate);
            submenu.setEndDate(endDate);

            SubMenu savedSubMenu = submenuService.saveSubMenu(submenu);
            String uploadDir = System.getProperty("user.dir") + "/uploads/submenu/" + savedSubMenu.getId();
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();
            String originalFilename = file.getOriginalFilename();
            File destFile = new File(uploadDir, originalFilename);
            int point = originalFilename.lastIndexOf(".");
            String baseName = originalFilename.substring(0, point);
            String extension = originalFilename.substring(point + 1);

            int count = 1;
            while (destFile.exists()) {
                String newFilename = baseName + "(" + count + ")." + extension;
                destFile = new File(uploadDir, newFilename);
                count++;
            }
            file.transferTo(destFile);
            savedSubMenu.setFilename(destFile.getName());

            submenuService.saveSubMenu(savedSubMenu);
            return ResponseEntity.ok("서브메뉴 등록 성공");
        } catch (Exception e) {
            e.printStackTrace();
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서브메뉴 등록 실패");
        }
    }
    @GetMapping("/getSubMenuList")
    public List<SubMenu> getSubMenuList(){
        return submenuService.getAllSubMenu();
    }

    // 서브메뉴 삭제
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteSubMenu(@PathVariable Long id) {

        Optional<SubMenu> submenu = submenuService.getSubMenuById(id);

        if (!submenu.isPresent()) {  // 수정: Optional의 값이 존재하지 않을 경우
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("서브메뉴를 찾을 수 없습니다.");
        }

        submenuService.deleteSubMenu(id);

        // 업로드된 파일 삭제 (서버에서 파일도 삭제)
        String uploadDir = System.getProperty("user.dir") + "/uploads/submenu/" + submenu.get().getId();
        File dir = new File(uploadDir);
        if (dir.exists() && dir.isDirectory()) {  // 수정: 디렉토리인지 확인
            for (File file : dir.listFiles()) {
                if (file.exists()) {
                    file.delete();
                }
            }
            dir.delete(); // 폴더 삭제
        }

        return ResponseEntity.ok("삭제 성공하였습니다.");
    }

}

package com.ict.serv.controller;

import com.ict.serv.entity.log.search.KeywordDTO;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.InteractService;
import com.ict.serv.service.LogService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/log")
public class LogController {
    private final LogService logService;
    private final InteractService interactService;

    @GetMapping("/searchRank")
    public List<KeywordDTO> getSearchRank(@RequestParam(defaultValue = "3") int hours,
                                    @RequestParam(defaultValue = "10") int topN) {
        return logService.getRealtimeKeywordRank(hours, topN);
    }

    @GetMapping("/recentSearch")
    public List<String> getRecentSearch(@AuthenticationPrincipal UserDetails userDetails) {
        User user = interactService.selectUserByName(userDetails.getUsername());

        return logService.getRecentSearchList(user.getId());
    }

    @GetMapping("/deleteRecentSearch")
    public void deleteRecentSearch(@AuthenticationPrincipal UserDetails userDetails,
                                   @RequestParam(required = false) String searchWord) {
        System.out.println("searchWord: " + searchWord);
        User user = interactService.selectUserByName(userDetails.getUsername());

        logService.deleteRecentSearch(user, searchWord);
    }
}

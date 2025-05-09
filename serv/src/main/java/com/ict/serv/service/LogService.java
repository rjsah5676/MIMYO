package com.ict.serv.service;

import com.ict.serv.entity.log.search.KeywordDTO;
import com.ict.serv.entity.log.search.SearchLog;
import com.ict.serv.entity.log.search.SearchState;
import com.ict.serv.entity.log.user.UserHitLog;
import com.ict.serv.entity.log.user.UserJoinLog;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.log.SearchLogRepository;
import com.ict.serv.repository.log.UserHitLogRepository;
import com.ict.serv.repository.log.UserJoinLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LogService {
    private final SearchLogRepository searchLogRepository;
    private Map<String, Integer> previousRankMap = new HashMap<>();
    private final UserJoinLogRepository userJoinLogRepository;
    private final UserHitLogRepository userHitLogRepository;

    public void saveSearch(User user, String ip, String keyword, String ec, String tc, String pc, LocalDateTime limit){
        if (isBlank(keyword) && isBlank(ec) && isBlank(tc) && isBlank(pc)) {
            return;
        }
        if (!isValidKeyword(keyword)) return;
        boolean exists = searchLogRepository.findRecentDuplicate(user, ip, keyword, ec, tc, pc, limit).isPresent();

        if (!exists) {
            SearchLog log = new SearchLog();
            log.setUser(user);
            log.setIp(user == null ? ip : null);
            log.setState(SearchState.ACTIVE);
            log.setSearchWord(keyword);
            log.setEventCategory(ec);
            log.setTargetCategory(tc);
            log.setProductCategory(pc);
            searchLogRepository.save(log);
        }
    }
    private boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }

    public List<KeywordDTO> getRealtimeKeywordRank(int hours, int topN) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        Pageable pageable = PageRequest.of(0, topN);

        List<Object[]> result = searchLogRepository.findTopKeywords(since, pageable);
        List<KeywordDTO> ranks = new ArrayList<>();

        int rank = 1;
        Map<String, Integer> currentRankMap = new HashMap<>();

        for (Object[] row : result) {
            String keyword = (String) row[0];
            Long count = (Long) row[1];
            currentRankMap.put(keyword, rank);

            // 순위 변동 계산
            Integer prevRank = previousRankMap.get(keyword);
            Object change;
            if (prevRank == null) {
                change = "NEW";  // 새로 등장한 키워드
            } else {
                change = prevRank - rank; // +: 상승, -: 하락
            }

            ranks.add(new KeywordDTO(keyword, count, change));
            rank++;
        }

        // 이전 순위 맵 업데이트
        previousRankMap = currentRankMap;

        return ranks;
    }

    public boolean isValidKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return false;
        String pattern = "^[가-힣a-zA-Z0-9\\s]+$";
        if (!keyword.matches(pattern)) return false;
        if (keyword.matches(".*(.)\\1{3,}.*")) return false;
        return true;
    }

    public List<String> getRecentSearchList(Long userId) {
        return searchLogRepository.findDistinctTop5SearchWordsByUserId(userId);
    }

    public void deleteRecentSearch(User user, String searchWord) {
        if (searchWord == null || searchWord.trim().isEmpty()) {
            searchLogRepository.softDeleteAllByUser(user);
        } else {
            searchLogRepository.softDeleteByUserAndSearchWord(user, searchWord);
        }
    }
    public void userJoinSave(User user) {
        LocalDate today = LocalDate.now();

        boolean alreadyLogged = userJoinLogRepository.existsByUserAndDateBetween(
                user,
                today.atStartOfDay(),
                today.plusDays(1).atStartOfDay()
        );

        if (alreadyLogged) return;

        UserJoinLog userJoinLog = new UserJoinLog();
        userJoinLog.setUser(user);
        userJoinLog.setDate(LocalDateTime.now());
        userJoinLogRepository.save(userJoinLog);
    }

    public void logProductHit(User user, Product product, String ip) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        boolean alreadyLogged = false;

        if (user != null) {
            alreadyLogged = userHitLogRepository.existsByUserAndProductAndDateBetween(user, product, startOfDay, endOfDay);
        } else {
            alreadyLogged = userHitLogRepository.existsByIpAndProductAndDateBetween(ip, product, startOfDay, endOfDay);
        }

        if (alreadyLogged) return;

        UserHitLog log = new UserHitLog();
        log.setProduct(product);
        log.setIp(ip);
        log.setDate(LocalDateTime.now());
        if (user != null) log.setUser(user);

        userHitLogRepository.save(log);
    }

    public List<UserHitLog> getHitList(User user) {
        return userHitLogRepository.findAllByUser(user);
    }

    public List<SearchLog> getSearchList(User user) {
        return searchLogRepository.findAllByUser(user);
    }
}

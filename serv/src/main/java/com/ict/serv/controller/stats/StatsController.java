package com.ict.serv.controller.stats;

import com.ict.serv.entity.order.OrderGroup;
import com.ict.serv.entity.sales.CategorySalesDTO;
import com.ict.serv.entity.sales.SalesStatsDTO;
import com.ict.serv.service.InquiryService;
import com.ict.serv.service.OrderService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequestMapping("/stats")
@RequiredArgsConstructor
@RestController
@CrossOrigin(origins = "*")
public class StatsController {
    private final OrderService orderService;
    private final InquiryService inquiryService;
    @Autowired
    private EntityManager entityManager;


    @GetMapping("/sales")
    public List<SalesStatsDTO> sales() {
        return orderService.getDailySalesStats();
    }
    @GetMapping("/category")
    public ResponseEntity<List<CategorySalesDTO>> getSalesByCategory() {
        return ResponseEntity.ok(orderService.getSalesByCategory());
    }

    @GetMapping("/event")
    public ResponseEntity<List<CategorySalesDTO>> getByEventCategory() {
        return ResponseEntity.ok(orderService.getSalesByEventCategory());
    }

    @GetMapping("/target")
    public ResponseEntity<List<CategorySalesDTO>> getByTargetCategory() {
        return ResponseEntity.ok(orderService.getSalesByTargetCategory());
    }
    @GetMapping("/joins")
    public List<Map<String, Object>> getJoinCountByDate() {
        String query = "SELECT DATE(j.date) as date, COUNT(j.id) as count " +
                "FROM UserJoinLog j GROUP BY DATE(j.date) ORDER BY DATE(j.date)";
        List<Object[]> results = entityManager.createQuery(query).getResultList();

        return results.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("date", r[0].toString());
            map.put("count", ((Long) r[1]).intValue());
            return map;
        }).collect(Collectors.toList());
    }
    @GetMapping("/registers")
    public List<Map<String, Object>> getDailyRegistrations() {
        String query = "SELECT DATE(u.createdDate) AS date, COUNT(u.id) AS count " +
                "FROM User u GROUP BY DATE(u.createdDate) ORDER BY date";
        List<Object[]> results = entityManager.createQuery(query).getResultList();

        return results.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("date", r[0].toString());
            map.put("count", ((Long) r[1]).intValue());
            return map;
        }).collect(Collectors.toList());
    }
    @GetMapping("/products")
    public List<Map<String, Object>> getDailyProductRegistrations() {
        String query = "SELECT DATE(p.startDate) AS date, COUNT(p.id) AS count " +
                "FROM Product p GROUP BY DATE(p.startDate) ORDER BY date";
        List<Object[]> results = entityManager.createQuery(query).getResultList();

        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0].toString());
            map.put("count", ((Long) row[1]).intValue());
            return map;
        }).collect(Collectors.toList());
    }
    @GetMapping("/reviews")
    public List<Map<String, Object>> getDailyReviewRegistrations() {
        String query = "SELECT DATE(r.reviewWritedate) AS date, COUNT(r.id) AS count " +
                "FROM Review r GROUP BY DATE(r.reviewWritedate) ORDER BY date";
        List<Object[]> results = entityManager.createQuery(query).getResultList();

        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0].toString());
            map.put("count", ((Long) row[1]).intValue());
            return map;
        }).collect(Collectors.toList());
    }

    @GetMapping("/inquiries/daily")
    public List<Map<String, Object>> getDailyInquiryStats() {
        return inquiryService.getDailyInquiryCount();
    }
}

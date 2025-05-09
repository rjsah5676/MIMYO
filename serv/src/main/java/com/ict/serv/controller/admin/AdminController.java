package com.ict.serv.controller.admin;

import com.ict.serv.dto.UserResponseDto;
import com.ict.serv.entity.Authority;
import com.ict.serv.entity.Inquiries.Inquiry;
import com.ict.serv.entity.Inquiries.InquiryPagingVO;
import com.ict.serv.entity.Inquiries.InquiryState;
import com.ict.serv.entity.coupon.Coupon;
import com.ict.serv.entity.coupon.CouponRequestDTO;
import com.ict.serv.entity.coupon.CouponState;
import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.order.*;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.product.ProductState;
import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.report.ReportSort;
import com.ict.serv.entity.report.ReportState;
import com.ict.serv.entity.settlement.Settlement;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.UserRepository;
import com.ict.serv.repository.order.OrderRepository;
import com.ict.serv.repository.settlement.SettlementRepository;
import com.ict.serv.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/admin")
public class AdminController {
    private final AdminService service;
    private final AuthService auth_service;
    private final InteractService inter_service;
    private final InquiryService inquiryService;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final SettlementRepository settlementRepository;
    private final CouponService couponService;

    @GetMapping("/reportList")
    public Map reportList(PagingVO pvo){
        //System.out.println("reportList"+pvo);
        pvo.setOnePageRecord(5);
        pvo.setTotalRecord(service.totalRecord(pvo));
        Map map = new HashMap();
        map.put("pvo", pvo);
        map.put("reportList", service.getAllReport(pvo, pvo.getState()));

        return map;
    }

    @GetMapping("/changeState")
    public String changeState(String state, Long id) {
        Report report = service.selectReport(id).get();
        report.setState(ReportState.valueOf(state));
        inter_service.sendReport(report);
        return "ok";
    }

    @GetMapping("/delReport")
    public String delReport(Long id) {
        service.deleteReport(id);
        return "ok";
    }

    @GetMapping("/inquiryList")
    public Map<String, Object> getAllInquiries(
            @RequestParam(value = "status") String statusStr,
            @RequestParam(value = "inquiryType", required = false, defaultValue = "") String inquiryType,
            @ModelAttribute InquiryPagingVO pvo) {
        InquiryState status;
        try {
            status = InquiryState.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", "Invalid status value: " + statusStr);
            errorMap.put("inquiryList", List.of());
            pvo.setNowPage(pvo.getNowPage());
            pvo.setTotalRecord(0);
            errorMap.put("pvo", pvo);
            return errorMap;
        }

        pvo.setNowPage(pvo.getNowPage());

        try {
            long totalRecord = service.countAdminInquiries(status, inquiryType);
            pvo.setTotalRecord((int) totalRecord);
        } catch (Exception e) {
            pvo.setTotalRecord(0);
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", "Error counting inquiries.");
            errorMap.put("inquiryList", List.of());
            errorMap.put("pvo", pvo);
            return errorMap;
        }
        List<Inquiry> inquiryList;
        try {
            inquiryList = service.getAdminInquiryList(pvo, status, inquiryType);
        } catch (Exception e) {
            inquiryList = List.of();
        }

        Map<String, Object> map = new HashMap<>();
        map.put("pvo", pvo);
        map.put("inquiryList", inquiryList);
        System.out.println(inquiryList.get(0).getInquiryStatus() + ":" +inquiryList.size());
        return map;
    }

    @GetMapping("/reportApprove")
    public String reportApprove(@AuthenticationPrincipal UserDetails userDetails, Long toId, Long fromId, Long reportId, ReportSort sort, Long sortId, String approveType, String comment) {
        User user = inter_service.selectUser(toId);
        Product product = productService.selectProduct(sortId).get();
        Report report = inter_service.selectReport(reportId).get();
        report.setReportText(comment);
        report.setSort(sort);
        report.setSortId(sortId);

        if(sort != null && sort.toString().equals("USER")) {
            if (approveType != null && approveType.equals("신고 취소")) {
                System.out.println("유저 신고 취소");
            } else
                user.setAuthority(Authority.ROLE_BANNED);
        } else if(sort != null && sort.toString().equals("PRODUCT")){
            if (approveType != null && approveType.equals("신고 취소")) {
                System.out.println("상품 신고 취소");
            }else
                product.setState(ProductState.PAUSE);
        }else if(sort !=null && sort.toString().equals("REVIEW")){
            if (approveType != null && approveType.equals("신고 취소")) {
                System.out.println("리뷰 신고 취소");
            }else
                product.setState(ProductState.PAUSE);
        }

        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSS");
        String formattedDate = now.format(formatter);

        report.setEndDate(formattedDate);
        report.setState(ReportState.COMPLETE);
        report.setReportResult(approveType);
        inter_service.sendReport(report);
        auth_service.saveUser(user);
        User from_user = inter_service.selectUser(fromId);
        Message msg = new Message();
        msg.setSubject("'"+user.getUsername()+"'님에 대한 신고 처리가 완료되었습니다.");
        msg.setComment("자세한 처리 내용은 마이페이지>신고내역을 확인해주세요.");
        msg.setUserTo(from_user);
        msg.setUserFrom(inter_service.selectUserByName(userDetails.getUsername()));
        inter_service.sendMessage(msg);

        return "ok";
    }

    @GetMapping("/getUsers")
    public ResponseEntity<Map<String, Object>> getUsersWithSearch(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String authority
    ) {
        Map<String, Object> response = new HashMap<>();
        long totalUserCount = userRepository.countByAuthority(Authority.ROLE_USER);
        response.put("totalCount", totalUserCount);

        if (keyword == null) keyword = "";
        keyword = keyword.trim();

        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "id"));
        Page<User> userPage;

        if (authority == null || "전체".equals(authority)) {
            userPage = userRepository.findByUseridContainingOrUsernameContaining(keyword, keyword, pageable);
        } else {
            Authority auth;
            try {
                if ("관리자".equals(authority)) auth = Authority.ROLE_ADMIN;
                else if ("사용자".equals(authority)) auth = Authority.ROLE_USER;
                else if ("정지중".equals(authority)) auth = Authority.ROLE_BANNED;
                else throw new IllegalArgumentException();
            } catch (Exception e) {
                response.put("message", "잘못된 권한 필터입니다.");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            userPage = userRepository.findByAuthorityAndUseridContainingOrAuthorityAndUsernameContaining(
                    auth, keyword, auth, keyword, pageable);
        }

        response.put("users", userPage.getContent());
        response.put("selectedCount", userPage.getTotalElements());
        response.put("totalPage", userPage.getTotalPages());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/banUser")
    public ResponseEntity<String> banUser(@RequestBody UserResponseDto request) {
    String userid = request.getUserid();
    Authority authority = request.getAuthority();
    Authority newAuthority;
        try {
            newAuthority = authority;
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>("잘못된 권한 값입니다.", HttpStatus.BAD_REQUEST);
        }

         User user = userRepository.findUserByUserid(userid);
            if (user.toString().isEmpty()) {
                return new ResponseEntity<>("해당 사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }

        user.setAuthority(newAuthority);
        userRepository.save(user);
        return new ResponseEntity<>("사용자 권한이 성공적으로 변경되었습니다.", HttpStatus.OK);
    }

    @GetMapping("/getSellersSettlement")
    public ResponseEntity<Map<String, Object>> getSellersSettlementWithSearch(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String keyword
    ) {
        Map<String, Object> response = new HashMap<>();

        keyword = (keyword == null) ? "" : keyword.trim();
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Map<String, Object>> sellerPage = null;

        if((year.isEmpty() || year.equals("전체")) && (month.isEmpty() || month.equals("전체"))){
            sellerPage = orderRepository.findSellersWithTotalSalesByConditionsNoYearNoMonth(0, 0,keyword, pageable);
        }
        else if((year.isEmpty() || year.equals("전체"))) {
            sellerPage = orderRepository.findSellersWithTotalSalesByConditionsNoYear(Integer.parseInt(month), keyword, pageable);
        }
        else if(month.isEmpty() || month.equals("전체")) {
            sellerPage = orderRepository.findSellersWithTotalSalesByConditionsNoMonth(Integer.parseInt(year), 0, keyword, pageable);
        }
        else {
            sellerPage = orderRepository.findSellersWithTotalSalesByConditions(Integer.parseInt(year), Integer.parseInt(month),
                                                                keyword, pageable);
        }

        response.put("sellers", sellerPage.getContent());
        response.put("selectedCount", sellerPage.getTotalElements());
        response.put("totalPage", sellerPage.getTotalPages());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/getSellerSoldProducts")
    public Map<String, Object> sellList(@RequestParam String user_id,
                                        @RequestParam(required = false) String year,
                                        @RequestParam(required = false) String month,
                                        @RequestParam(required = false) ShippingState shippingState) {

        User user = inter_service.selectUserByName(user_id);
        List<Orders> orders = new ArrayList<>();

        if (shippingState == ShippingState.FINISH) {
            boolean hasYear = year != null && !year.isEmpty() && !year.equals("전체");
            boolean hasMonth = month != null && !month.isEmpty() && !month.equals("전체");

            if (hasYear && hasMonth) {
                int parsedYear = Integer.parseInt(year);
                int parsedMonth = Integer.parseInt(month);
                orders = orderRepository.findAllByProductSellerNoAndShippingStateAndYearAndMonth(
                        user.getId(), ShippingState.FINISH.name(), parsedYear, parsedMonth);
            } else if (hasYear) {
                int parsedYear = Integer.parseInt(year);
                orders = orderRepository.findAllByProductSellerNoAndShippingStateAndYear(
                        user.getId(), ShippingState.FINISH.name(), parsedYear);
            } else if (hasMonth) {
                int parsedMonth = Integer.parseInt(month);
                orders = orderRepository.findAllByProductSellerNoAndShippingStateAndMonth(
                        user.getId(), ShippingState.FINISH.name(), parsedMonth);
            } else {
                orders = orderRepository.findAllByProductSellerNoAndShippingState(user, ShippingState.FINISH);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("orderList", orders);
        return result;
    }

    @PostMapping("/handleSettle")
    public String handleSettle(@RequestBody Map<String, List<Orders>> ordersMap) {
        List<Orders> ordersList = new ArrayList<>();
        for(Orders odd : ordersMap.get("orders")){
            ordersList.add(orderRepository.findById(odd.getId()).get());
        }

        for(Orders orders: ordersList) {
            orders.setShippingState(ShippingState.SETTLED);
            orderRepository.save(orders);
            Settlement settlement = new Settlement();
            settlement.setUser(orders.getProduct().getSellerNo());
            settlement.setOrders(orders);
            int price = 0;
            for(OrderItem item : orders.getOrderItems()) {
                price+= (item.getPrice() - item.getDiscountRate()*item.getPrice()/100 + item.getAdditionalFee())*item.getQuantity();
            }
            price+=orders.getShippingFee();
            settlement.setTotalSettlePrice(price);
            settlement.setCreateDate(LocalDateTime.now());
            settlementRepository.save(settlement);
        }
        return "ok";
    }

    @GetMapping("/getSettledSellersList")
    public ResponseEntity<Map<String, Object>> getSettledSellersListWithSearch(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String keyword
    ) {
        Map<String, Object> response = new HashMap<>();

        keyword = (keyword == null) ? "" : keyword.trim();
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Map<String, Object>> sellerPage = null;

        if((year.isEmpty() || year.equals("전체")) && (month.isEmpty() || month.equals("전체"))){
            sellerPage = orderRepository.findSettledListWithTotalSalesByConditionsNoYearNoMonth(0, 0,keyword, pageable);
        }
        else if((year.isEmpty() || year.equals("전체"))) {
            sellerPage = orderRepository.findSettledListWithTotalSalesByConditionsNoYear(Integer.parseInt(month), keyword, pageable);
        }
        else if(month.isEmpty() || month.equals("전체")) {
            sellerPage = orderRepository.findSettledListWithTotalSalesByConditionsNoMonth(Integer.parseInt(year), 0, keyword, pageable);
        }
        else {
            sellerPage = orderRepository.findSettledListWithTotalSalesByConditions(Integer.parseInt(year), Integer.parseInt(month),
                    keyword, pageable);
        }

        response.put("sellers", sellerPage.getContent());
        response.put("selectedCount", sellerPage.getTotalElements());
        response.put("totalPage", sellerPage.getTotalPages());

        System.out.println("정산 완료 판매자 목록"+response);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/getSellerSettledProducts")
    public Map<String, Object> settledProductList(@RequestParam String user_id,
                                        @RequestParam(required = false) String settledYear,
                                        @RequestParam(required = false) String settledMonth,
                                        @RequestParam(required = false) ShippingState shippingState) {

        User user = inter_service.selectUserByName(user_id);
        List<Orders> orders = new ArrayList<>();

        if (shippingState == ShippingState.SETTLED) {
            boolean settledHasYear = settledYear != null && !settledYear.isEmpty() && !settledYear.equals("전체");
            boolean settledHasMonth = settledMonth != null && !settledMonth.isEmpty() && !settledMonth.equals("전체");

            if (settledHasYear && settledHasMonth) {
                int settledParsedYear = Integer.parseInt(settledYear);
                int settledParsedMonth = Integer.parseInt(settledMonth);
                orders = orderRepository.findAllByProductSellerNoAndShippingStateAndYearAndMonth(
                        user.getId(), ShippingState.SETTLED.name(), settledParsedYear, settledParsedMonth);
            } else if (settledHasYear) {
                int settledParsedYear = Integer.parseInt(settledYear);
                orders = orderRepository.findAllByProductSellerNoAndShippingStateAndYear(
                        user.getId(), ShippingState.SETTLED.name(), settledParsedYear);
            } else if (settledHasMonth) {
                int settledParsedMonth = Integer.parseInt(settledMonth);
                orders = orderRepository.findAllByProductSellerNoAndShippingStateAndMonth(
                        user.getId(), ShippingState.SETTLED.name(), settledParsedMonth);
            } else {
                orders = orderRepository.findAllByProductSellerNoAndShippingState(user, ShippingState.SETTLED);
            }
        }
        System.out.println("정산 완료 제품 목록");
        Map<String, Object> result = new HashMap<>();
        result.put("orderList", orders);
        return result;
    }
    @PostMapping("/giveCoupon")
    public String giveCoupon(@RequestBody CouponRequestDTO dto) {
        if(dto.getUserId() == 0){
            for(User user : inter_service.getAllUserList()) {
                Coupon coupon = new Coupon();
                coupon.setCouponName(dto.getCouponName());
                coupon.setEndDate(LocalDateTime.now().plusYears(1));
                coupon.setDiscount(dto.getDiscount());
                coupon.setStartDate(LocalDateTime.now());
                coupon.setType("ADMIN");
                coupon.setState(CouponState.AVAILABLE);
                coupon.setUser(user);
                couponService.saveCoupon(coupon);
            }
        }
        else {
            Coupon coupon = new Coupon();
            coupon.setCouponName(dto.getCouponName());
            coupon.setEndDate(LocalDateTime.now().plusYears(1));
            coupon.setDiscount(dto.getDiscount());
            coupon.setStartDate(LocalDateTime.now());
            coupon.setType("ADMIN");
            coupon.setState(CouponState.AVAILABLE);
            if(inter_service.selectUser(dto.getUserId()) == null) return "no_user";
            coupon.setUser(inter_service.selectUser(dto.getUserId()));
            couponService.saveCoupon(coupon);
        }
        return "ok";
    }
}




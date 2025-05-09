package com.ict.serv.controller;

import com.ict.serv.dto.PopUserDTO;
import com.ict.serv.dto.UserResponseDto;
import com.ict.serv.entity.coupon.Coupon;
import com.ict.serv.entity.coupon.CouponPagingVO;
import com.ict.serv.entity.coupon.CouponState;
import com.ict.serv.entity.report.ReportSort;
import com.ict.serv.entity.report.ReportState;
import com.ict.serv.entity.user.Follow;
import com.ict.serv.entity.wish.WishPagingVO;
import com.ict.serv.entity.wish.Wishlist;
import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.message.MessageResponseDTO;
import com.ict.serv.entity.message.MessageState;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.user.User;
import com.ict.serv.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.parameters.P;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@RequestMapping("/interact")
public class InteractController {
    private final InteractService service;
    private final ProductService productService;
    private final CouponService couponService;
    private final OrderService orderService;
    private final MypageService mypageService;

    @GetMapping("/getToUser")
    public MessageResponseDTO getToUser(Long toId) {
        User user = service.selectUser(toId);
        return new MessageResponseDTO(user.getId(),user.getUsername(),user.getUserid(),user.getProfileImageUrl());
    }

    @GetMapping("/sendMessage")
    public String sendMessage(@AuthenticationPrincipal UserDetails userDetails, Long toId, String subject, String comment) {
        Message msg = new Message();
        msg.setSubject(subject);
        msg.setComment(comment);
        msg.setUserTo(service.selectUser(toId));
        msg.setUserFrom(service.selectUserByName(userDetails.getUsername()));
        service.sendMessage(msg);
        return "ok";
    }

    @GetMapping("/getMessageList")
    public List<Message> getMessageList(@AuthenticationPrincipal UserDetails userDetails){
        return service.getMessageList(service.selectUserByName(userDetails.getUsername()));
    }
    @GetMapping("/readMessage")
    public String readMessage(Long id) {
        Message msg = service.selectMessage(id);
        msg.setState(MessageState.READ);
        service.sendMessage(msg);
        return "ok";
    }
    @GetMapping("/deleteMessage")
    public String deleteMessage(Long id) {
        service.deleteMessage(id);
        return "ok";
    }
    @GetMapping("/allDelete")
    public String allDelete(@AuthenticationPrincipal UserDetails userDetails) {
        User user = service.selectUserByName(userDetails.getUsername());
        List<Message> msg_list = service.getMessageList(service.selectUserByName(userDetails.getUsername()));
        for(Message msg : msg_list) {
            if(msg.getState() == MessageState.READ) {
                service.deleteMessage(msg.getId());
            }
        }
        return "ok";
    }
    @GetMapping("/allRead")
    public String allRead(@AuthenticationPrincipal UserDetails userDetails) {
        User user = service.selectUserByName(userDetails.getUsername());
        List<Message> msg_list = service.getMessageList(service.selectUserByName(userDetails.getUsername()));
        for(Message msg : msg_list) {
            msg.setState(MessageState.READ);
            service.sendMessage(msg);
        }
        return "ok";
    }
    @GetMapping("/sendReport")
    public String sendReport(@AuthenticationPrincipal UserDetails userDetails, Long toId, String reportType, String comment, ReportSort sort, Long sortId ) {
        Report report = new Report();
        report.setComment(comment);
        report.setSort(sort);
        report.setSortId(sortId);
        report.setReportUser(service.selectUser(toId));
        report.setUserFrom(service.selectUserByName(userDetails.getUsername()));
        report.setReportType(reportType);
        /*
        msg.setSubject(subject);
        msg.setComment(comment);
        msg.setUserTo(service.selectUser(toId));
        msg.setUserFrom(service.selectUserByName(userDetails.getUsername()));*/
        service.sendReport(report);
        return "ok";
    }

    @GetMapping("/getUserInfo")
    public UserResponseDto getUserInfo(Long id) {
        User user = service.selectUser(id);
        UserResponseDto response = new UserResponseDto();
        response.setId(id);
        response.setUserid(user.getUserid());
        response.setImgUrl(user.getProfileImageUrl());
        response.setEmail(user.getEmail());
        response.setUsername(user.getUsername());
        response.setInfoText(user.getInfoText());
        response.setGradePoint(user.getGradePoint());
        response.setGrade(user.getGrade());

        return response;
    }
    @GetMapping("/getWish")
    public Wishlist getWish(Long userId, Long productId){
        return service.selectWish(userId,productId);
    }

    @GetMapping("/addWish")
    public Wishlist addWish(Long userId, Long productId){
        User user = new User();
        user.setId(userId);
        Product product = new Product();
        product.setId(productId);
        Wishlist wish = new Wishlist();
        wish.setUser(user);
        wish.setProduct(product);
        return service.insertWish(wish);
    }

    @GetMapping("/delWish")
    public String delWish(Long userId, Long productId){
        service.deleteWish(service.selectWish(userId,productId));
        return "ok";
    }

    @GetMapping("/getWishList")
    public Map getWishList(@AuthenticationPrincipal UserDetails userDetails, WishPagingVO pvo) {
        User user = service.selectUserByName(userDetails.getUsername());
        pvo.setOnePageRecord(5);
        pvo.setTotalRecord(service.wishTotalRecord(pvo,user));
        Map map = new HashMap();
        map.put("pvo",pvo);
        map.put("wishList", service.getAllWishList(pvo,user));
        return map;
    }

    @GetMapping("/getAllCouponList")
    public Map getAllCouponList(@AuthenticationPrincipal UserDetails userDetails, CouponPagingVO pvo) {
        User user = service.selectUserByName(userDetails.getUsername());
        pvo.setOnePageRecord(5);
        pvo.setTotalRecord(service.couponTotalRecord(pvo,user));
        Map map = new HashMap();
        map.put("pvo",pvo);
        map.put("couponList", service.getAllCouponList(pvo,user));
        return map;
    }

    @GetMapping("/getAllPointList")
    public Map getAllPointList(@AuthenticationPrincipal UserDetails userDetails, CouponPagingVO pvo) {
        User user = service.selectUserByName(userDetails.getUsername());
        pvo.setOnePageRecord(10);
        pvo.setTotalRecord(service.pointTotalRecord(user));
        Map map = new HashMap();
        map.put("pvo",pvo);
        map.put("pointList", service.getAllPointList(pvo,user));
        return map;
    }

    @GetMapping("/getFollowState")
    public boolean getFollowState(Long from, Long to) {
        return service.selectFollow(from, to) != null; // 있으면 true, 없으면 false
    }

    @GetMapping("/followUser")
    public void followUser(Long from, Long to, boolean state) {
        System.out.println(state);
        if (!state) {
            Follow follow = new Follow();
            follow.setUserFrom(service.selectUser(from));
            follow.setUserTo(service.selectUser(to));

            service.insertFollow(follow);
        } else {
            service.deleteFollow(service.selectFollow(from, to));
        }
    }

    @GetMapping("/getCouponList")
    public List<Coupon> getCouponList(@AuthenticationPrincipal UserDetails userDetails) {
        return couponService.findCouponByState(CouponState.AVAILABLE,service.selectUserByName(userDetails.getUsername()));
    }

    @GetMapping("/getPopUser")
    public List<PopUserDTO> getPopUser(){
        List<User> userList = service.getAllUserList();
        List<PopUserDTO> result = new ArrayList<>();
        for(User user: userList) {
            int orderCount = orderService.getOrderCountBySeller(user);
            int reviewCount = service.getReviewCountBySeller(user);
            double reviewAverage = service.getReviewAverage(user);
            int followerCount = service.getFollowerList(user.getId()).size();
            int wishCount = mypageService.getWishCount(user.getId());
            List<Product> productList = productService.selectProductByUser(user);
            PopUserDTO popUserDTO = new PopUserDTO();
            popUserDTO.setFollowerCount(followerCount);
            popUserDTO.setProductList(productList);
            popUserDTO.setUser(user);
            popUserDTO.setOrderCount(orderCount);
            popUserDTO.setReviewCount(reviewCount);
            popUserDTO.setReviewAverage(reviewAverage);
            popUserDTO.setWishCount(wishCount);
            double score = followerCount + reviewCount*3 + orderCount*2 + wishCount*2 + productList.size()*0.5;
            popUserDTO.setScore(score);
            result.add(popUserDTO);
        }

        result.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        return result.size() > 5 ? result.subList(0, 5) : result;
    }
}

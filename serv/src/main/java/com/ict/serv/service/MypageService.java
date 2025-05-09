package com.ict.serv.service;

import com.ict.serv.controller.admin.PagingVO;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.user.Address;
import com.ict.serv.entity.user.Guestbook;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.*;
import com.ict.serv.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MypageService {
    private final ReportRepository report_repo;
    private final GuestbookRepository guestbook_repo;
    private final ProductRepository product_repo;
    private final WishRepository wish_repo;
    private final AddressRepository address_repo;
    private final FollowRepository follow_repo;
    private final UserRepository user_repo;

    public List<Report> getReportByUserFrom(User user, PagingVO pvo) {
        return report_repo.findAllByUserFromOrderByCreateDateDesc(user, PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
    }
    public int totalReportRecord(User user){
        return report_repo.countIdByUserFrom(user);
    }

    public void insertGuestbook(Guestbook guestbook) {
        guestbook_repo.save(guestbook);
    }

    public List<Guestbook> selectGuestbookAll(User user) {
        return guestbook_repo.findAllByReceiverAndOriginalIdOrderByWritedateDesc(user, 0);
    }

    public Optional<Guestbook> selectGuestbookById(int id) {
        return guestbook_repo.findById(id);
    }

    public void deleteGuestbook(Guestbook guestbook) {
        guestbook_repo.delete(guestbook);
    }

    public List<Product> selectProductBySellerNo(Long id) {
        return product_repo.findAllBySellerNo_Id(id);
    }

    public List<Guestbook> selectReplyAll(int id) {
        return guestbook_repo.findAllByOriginalId(id);
    }

    public int getWishCount(Long sellerId) {
        return wish_repo.countWishBySeller(sellerId);
    }

    public List<Address> getAddrList(User user) { return address_repo.findAllByUser(user);}

    public Address insertAddress(Address address) { return address_repo.save(address);}

    public Optional<User> selectUserInfo(User user) {
        return user_repo.findById(user.getId());
    }

    public Optional<Address> selectUserAddress(Long addressId) {
        return address_repo.findById(addressId);
    }

    public Address updateAddressState(Address address) {
        return address_repo.save(address);
    }
}

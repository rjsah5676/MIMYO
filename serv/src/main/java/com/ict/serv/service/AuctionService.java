package com.ict.serv.service;

import com.ict.serv.context.ApplicationContextProvider;
import com.ict.serv.controller.product.ProductPagingVO;
import com.ict.serv.entity.Authority;
import com.ict.serv.entity.auction.*;
import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.product.ProductState;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.MessageRepository;
import com.ict.serv.repository.UserRepository;
import com.ict.serv.repository.auction.AuctionBidRepository;
import com.ict.serv.repository.auction.AuctionProductRepository;
import com.ict.serv.repository.auction.AuctionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final AuctionBidRepository bidRepository;
    private final AuctionProductRepository auctionProductRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final ConcurrentHashMap<String, ScheduledFuture<?>> endTasks = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate messagingTemplate;

    public String createRoom(User user, String subject, AuctionWriteRequest req, AuctionProduct product) {
        String roomId = UUID.randomUUID().toString();

        int rawIncrement = (req.getFirstPrice() + req.getBuyNowPrice()) / 20;
        int minBidIncrement = ((rawIncrement + 99) / 100) * 20;

        AuctionRoom room = AuctionRoom.builder()
                .roomId(roomId)
                .state(AuctionState.OPEN)
                .subject(subject)
                .createdAt(LocalDateTime.now())
                .lastBidTime(LocalDateTime.now())
                .endTime(req.getEndTime())
                .minBidIncrement(minBidIncrement)
                .firstPrice(req.getFirstPrice())
                .buyNowPrice(req.getBuyNowPrice())
                .currentPrice(req.getFirstPrice())
                .deposit(req.getDeposit())
                .auctionProduct(product)
                .build();
        auctionRepository.save(room);

        scheduleAuctionEnd(roomId);

        return roomId;
    }

    public List<AuctionRoom> getOpenRooms() {
        return auctionRepository.findByState(AuctionState.OPEN);
    }

    public void saveBid(String roomId, User user, int price) {
        AuctionRoom room = auctionRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        List<AuctionBid> bidList = bidRepository.findByRoomOrderByBidTimeAsc(room);
        Message sender = new Message();
        List<User> admins = userRepository.findUserByAuthority(Authority.ROLE_ADMIN);
        for(User admin: admins) {
            sender.setUserFrom(admin);
            sender.setUserTo(room.getAuctionProduct().getSellerNo());
            sender.setSubject("새로운 입찰이 등록 되었습니다.");
            sender.setComment("'" + room.getAuctionProduct().getProductName()+"'"+": "+ price+"원"+"  \n상세 내용은 마이페이지 > 판매 입찰 내역 에서 확인해주세요.");
            messageRepository.save(sender);
            break;
        }
        for(AuctionBid mini: bidList) {
            if(mini.getState() == BidState.LIVE) {
                Message msg = new Message();
                msg.setUserFrom(room.getAuctionProduct().getSellerNo());
                msg.setUserTo(mini.getUser());
                msg.setSubject("입찰이 취소처리 되었습니다.");
                msg.setComment("'" + room.getAuctionProduct().getProductName()+"' 물품의 입찰이 취소되었습니다. \n보증금은 1일 내 환불처리 됩니다.");
                messageRepository.save(msg);
                mini.setState(BidState.DEAD);
                bidRepository.save(mini);
            }
        }
        AuctionBid bid = AuctionBid.builder()
                .room(room)
                .user(user)
                .price(price)
                .bidTime(LocalDateTime.now())
                .state(BidState.LIVE)
                .build();

        bidRepository.save(bid);
        room.setLastBidTime(LocalDateTime.now());

        LocalDateTime now = LocalDateTime.now();
        if (room.getEndTime().isBefore(now.plusMinutes(5))) {
            room.setEndTime(room.getEndTime().plusMinutes(1));
        }
        room.setCurrentPrice(price);
        room.setHighestBidderId(user.getId());
        room.setHit(bidList.size()+1);
        auctionRepository.save(room);

        scheduleAuctionEnd(roomId);
    }

    @Transactional
    public void closeAuctionRoom(String roomId) {
        AuctionRoom room = auctionRepository.findById(roomId).orElse(null);
        AuctionProduct product = auctionProductRepository.getReferenceById(Objects.requireNonNull(room).getAuctionProduct().getId());
        if (room.getState() == AuctionState.OPEN) {
            if (LocalDateTime.now().isAfter(room.getEndTime())) {
                room.setState(AuctionState.CLOSED);
                product.setState(ProductState.PAUSE);
                auctionRepository.save(room);
                auctionProductRepository.save(product);
                messagingTemplate.convertAndSend("/topic/auction/" + roomId + "/end", "경매 종료");
                if(room.getHighestBidderId() != null) {
                    User user = userRepository.findUserById(room.getHighestBidderId());
                    List<AuctionBid> bids = bidRepository.findByStateAndUserAndRoom(BidState.LIVE, user, room);
                    if (!bids.isEmpty()) {
                        AuctionBid bid = bids.get(0);
                        bid.setState(BidState.SUCCESS);
                        bidRepository.save(bid);
                    }
                    Message msg = new Message();
                    msg.setUserFrom(room.getAuctionProduct().getSellerNo());
                    msg.setUserTo(user);
                    msg.setSubject("입찰 하신 물품 '" + product.getProductName() + "'이 낙찰되었습니다.");
                    msg.setComment("<a href='/mypage/buybid'>마이페이지 > 구매 입찰 내역</a>에서 결제를 완료해주세요.");
                    messageRepository.save(msg);
                }
            } else {
                scheduleAuctionEnd(roomId);
            }
        }
    }

    private void scheduleAuctionEnd(String roomId) {
        if (endTasks.containsKey(roomId)) {
            endTasks.get(roomId).cancel(false);
        }

        AuctionRoom room = auctionRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        long delay = java.time.Duration.between(LocalDateTime.now(), room.getEndTime()).toMillis();

        if (delay <= 0) {
            closeAuctionRoom(roomId);
            return;
        }

        ScheduledFuture<?> future = scheduler.schedule(() -> {
            try {
                AuctionService proxy = ApplicationContextProvider.getBean(AuctionService.class);
                proxy.closeAuctionRoom(roomId);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }, delay, TimeUnit.MILLISECONDS);

        endTasks.put(roomId, future);
    }

    public List<AuctionBid> getBids(String roomId) {
        AuctionRoom room = auctionRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        return bidRepository.findByRoomOrderByBidTimeAsc(room);
    }

    public List<AuctionRoom> findAuctionRoomByAuctionProduct(AuctionProduct auctionProduct){
        return auctionRepository.findByAuctionProduct(auctionProduct);
    }

    @Transactional
    public void deleteRoom(String roomId) {
        bidRepository.deleteByRoom_RoomId(roomId);
        auctionRepository.deleteById(roomId);
    }

    public AuctionProduct saveAuctionProduct(AuctionProduct auctionProduct) {
        return auctionProductRepository.save(auctionProduct);
    }

    public Optional<AuctionRoom> getAuctionRoom(String roomId) {
        return auctionRepository.findById(roomId);
    }
    public Optional<AuctionProduct> getAuctionProduct(Long id) {
        return auctionProductRepository.findById(id);
    }

    public int searchCountAll(ProductPagingVO pvo, List<String> categories) {
        if(categories.isEmpty()|| categories.get(0).isEmpty()) return auctionProductRepository.countAuctionProductsNoCategory(pvo.getSearchWord(),pvo.getEventCategory(),pvo.getTargetCategory());
        else return auctionProductRepository.countAuctionProductsAllCategory(pvo.getSearchWord(),pvo.getEventCategory(),pvo.getTargetCategory(), categories);
    }
    public List<AuctionProduct> searchAll(ProductPagingVO pvo, List<String> categories) {
        if(categories.isEmpty() || categories.get(0).isEmpty()) {
            return auctionProductRepository.findAuctionProductsNoCategory(pvo.getSearchWord(), pvo.getEventCategory(), pvo.getTargetCategory(), PageRequest.of(pvo.getNowPage() - 1, pvo.getOnePageRecord()));
        }else return auctionProductRepository.findAuctionProductsAllCategory(pvo.getSearchWord(),pvo.getEventCategory(),pvo.getTargetCategory(), categories,PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
    }
    public AuctionRoom saveAuctionRoom(AuctionRoom auctionRoom){
        return auctionRepository.save(auctionRoom);
    }

    public int totalAuctionBidCount(User user, BidPagingVO pvo) {
        if(pvo.getState() == null) return bidRepository.countIdByUser(user);
        return bidRepository.countIdByUserAndState(user, pvo.getState());
    }

    public int totalAuctionSellBidCount(User user, BidPagingVO pvo) {
        if(pvo.getState() == null) return bidRepository.countAllBidsBySeller(user.getId());
        return bidRepository.countBidsBySellerAndState(user.getId(), pvo.getState().name());
    }

    public List<AuctionBid> searchAuctionBid(User user, BidPagingVO pvo) {
        if(pvo.getState() == null) return bidRepository.findAllByUserOrderByIdDesc(user,PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
        return bidRepository.findAllByUserAndStateOrderByIdDesc(user, pvo.getState(),PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
    }

    public List<AuctionBid> searchAuctionSellBid(User user, BidPagingVO pvo) {
        if(pvo.getState() == null) return bidRepository.findSellByUserOrderByIdDesc(user.getId(),PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
        return bidRepository.findSellByUserAndStateOrderByIdDesc(user.getId(), pvo.getState().name(),PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
    }

    public List<AuctionBid> findAuctionBidByRoomAndState(AuctionRoom room, BidState state) {
        return bidRepository.findAllByRoomAndState(room,state);
    }

    public AuctionBid updateBid(AuctionBid bid) {
        return bidRepository.save(bid);
    }

    public List<AuctionRoom> getHotAuctionRooms() {
        return auctionRepository.findTop50ByStateOrderByHitDesc(AuctionState.OPEN);
    }

    public List<AuctionRoom> getClosingAuctionRooms() {
        return auctionRepository.findTop50ByStateOrderByEndTime(AuctionState.OPEN);
    }

    @Transactional
    public void closeAllAuctionIfClosed() {
        List<AuctionRoom> auctionRoomList = auctionRepository.findByState(AuctionState.OPEN);
        for(AuctionRoom auctionRoom: auctionRoomList) {
            if(auctionRoom.getEndTime().isBefore(LocalDateTime.now())) {
                closeAuctionRoom(auctionRoom.getRoomId());
            }
        }
    }

    public List<AuctionProduct> selecteAuctionProductByUser(User user) {
        return auctionProductRepository.findAllBySellerNo(user);
    }

    public String getAuctionRoomByProduct(Optional<AuctionProduct> auctionProduct) {
        return auctionRepository.findByAuctionProduct(auctionProduct.get()).get(0).getRoomId();
    }

    public int getAuctionDeposit(AuctionProduct auctionProduct) {
        return auctionRepository.findByAuctionProduct(auctionProduct).get(0).getDeposit();
    }
}

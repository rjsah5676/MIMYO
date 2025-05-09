package com.ict.serv.service;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.review.Review;
import com.ict.serv.entity.review.ReviewImage;
import com.ict.serv.entity.review.ReviewLike;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.review.ReviewImageRepository;
import com.ict.serv.repository.review.ReviewLikeRepository;
import com.ict.serv.repository.review.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {
    private final ReviewRepository repository;
    private final ReviewLikeRepository like_repository;
    private final ReviewImageRepository image_repository;

    public Review saveReview(Review review) {
        return repository.save(review);
    }

    public boolean selectCheckReview(User user, Product product) {
        return repository.findByUserAndProduct(user, product).isPresent();
    }

    public List<Review> productReviewList(Product product) {
        return repository.findByProduct(product);
    }

    public ReviewLike likeInsert(ReviewLike reviewLike) {
        return like_repository.save(reviewLike);
    }

    public int getLikeCountByReviewId(Long reviewId) {
        return like_repository.countByReviewId(reviewId);
    }

    public boolean isUserLikedReview(Long userId, Long reviewId) {
        return like_repository.existsByUserIdAndReviewId(userId, reviewId);
    }

    public int likeDelete(Review review, User user) {
        return like_repository.deleteByReviewAndUser(review, user);
    }

    public Optional<Review> selectReviewId(Long id) {
        return repository.findById(id);
    }

    public int deleteReviewImage(Review review) {
        return image_repository.deleteByReview(review);
    }

    public void deleteReview(Optional<Review> review) {
        repository.deleteById(review.get().getId()); // 리뷰 삭제
        image_repository.deleteByReview(review.get()); // 리뷰 이미지 삭제
        like_repository.deleteByReview(review.get()); // 리뷰 좋아요 삭제
    }

    public List<Review> selectProductId(Product product) {
        return repository.findByProduct(product);
    }

    public List<Review> selectMyReviewList(User user) {
        return repository.findByUser(user);
    }

    public List<Review> findByProduct(Product product) {

        List<Review> reviews = repository.findAllByProductOrderByReviewWritedateDesc(product); // DB에서 리뷰 조회


        return reviews; // 최종적으로 각 상품 ID에 대한 리뷰 리스트를 반환
    }

    public int countAllByProductList(List<Product> productList) {
        return repository.countByProductIn(productList);
    }
}
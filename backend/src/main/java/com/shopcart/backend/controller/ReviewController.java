package com.shopcart.backend.controller;

import com.shopcart.backend.dto.ReviewRequest;
import com.shopcart.backend.model.Review;
import com.shopcart.backend.repository.ReviewRepository;
import com.shopcart.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private ReviewRepository reviewRepository;

    /**
     * Lấy danh sách tất cả đánh giá (Public endpoint)
     * Endpoint: GET /api/reviews
     */
    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        List<Review> reviews = reviewRepository.findAll();
        return ResponseEntity.ok(reviews);
    }

    /**
     * Gửi đánh giá sản phẩm (Có tích hợp AI kiểm tra giả mạo)
     * Endpoint: POST /api/reviews
     */
    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody ReviewRequest request) {
        // Lấy userId từ request, fallback về 1L nếu không có
        Long currentUserId = request.getUserId() != null ? request.getUserId() : 1L;

        // GlobalExceptionHandler sẽ tự bắt các lỗi: "Chưa mua hàng", "AI phát hiện spam"
        Review savedReview = reviewService.submitReview(currentUserId, request);
        return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
    }
}
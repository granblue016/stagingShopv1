package com.shopcart.backend.controller;

import com.shopcart.backend.dto.ReviewRequest;
import com.shopcart.backend.model.Review;
import com.shopcart.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    /**
     * Gửi đánh giá sản phẩm (Có tích hợp AI kiểm tra giả mạo)
     * Endpoint: POST /api/reviews
     */
    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody ReviewRequest request) {
        // Tạm thời mock UserID = 1. Sau khi Windsurf nối JWT,
        // chúng ta sẽ lấy từ SecurityContextHolder.
        Long currentUserId = 1L;

        // GlobalExceptionHandler sẽ tự bắt các lỗi: "Chưa mua hàng", "AI phát hiện spam"
        Review savedReview = reviewService.submitReview(currentUserId, request);
        return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
    }
}
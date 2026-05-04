package com.shopcart.backend.service;

import com.shopcart.backend.dto.AIAnalysisResponse;
import com.shopcart.backend.dto.ReviewRequest;
import com.shopcart.backend.model.Review;
import com.shopcart.backend.repository.OrderRepository;
import com.shopcart.backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private NLPServiceClient nlpClient;

    @Transactional
    public Review submitReview(Long userId, ReviewRequest request) {
        // 1. Kiểm tra Verified Purchase
        // Chỉ cho phép bình luận nếu đơn hàng đã thanh toán, đang giao hoặc đã nhận
        checkVerifiedPurchase(userId, request.getProductId());

        // 2. Gọi AI để phân tích nội dung
        AIAnalysisResponse aiResult = nlpClient.analyzeReview(request.getContent());

        // 3. Map kết quả AI vào Entity Review
        Review review = new Review();
        review.setUserId(userId);
        review.setProductId(request.getProductId());
        review.setContent(request.getContent());
        review.setRating(request.getRating());

        // Đổ dữ liệu thông minh từ AI
        review.setSentiment(aiResult.getSentiment());
        review.setIsFake(aiResult.isFake());
        review.setPriority(aiResult.getPriority());
        review.setHelpfulnessScore(aiResult.getHelpfulnessScore());

        // Lưu lại các tính năng gợi ý trích xuất bởi AI
        review.setSuggestedFeatures(aiResult.getSuggestedFeatures());

        return reviewRepository.save(review);
    }

    private void checkVerifiedPurchase(Long userId, Long productId) {
        List<String> validStatuses = Arrays.asList("PAID", "SHIPPED", "DELIVERED");
        boolean hasPurchased = orderRepository.existsVerifiedPurchase(userId, productId, validStatuses);

        if (!hasPurchased) {
            throw new RuntimeException("Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã được thanh toán hoặc giao thành công.");
        }
    }
}
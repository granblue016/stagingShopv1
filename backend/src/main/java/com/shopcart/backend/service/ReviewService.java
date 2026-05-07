package com.shopcart.backend.service;

import com.shopcart.backend.dto.NlpResponse;
import com.shopcart.backend.dto.ReviewRequest;
import com.shopcart.backend.model.Review;
import com.shopcart.backend.repository.OrderRepository;
import com.shopcart.backend.repository.ReviewRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private NlpService nlpService;

    @Transactional
    public Review submitReview(Long userId, ReviewRequest request) {
        // 1. Kiểm tra Verified Purchase
        // Chỉ cho phép bình luận nếu đơn hàng đã thanh toán, đang giao hoặc đã nhận
        // TODO: Bypass tạm thời cho testing - cần enable lại cho production
        // checkVerifiedPurchase(userId, request.getProductId());

        // 2. Tạo review trước với dữ liệu cơ bản
        Review review = new Review();
        review.setUserId(userId);
        review.setProductId(request.getProductId());
        review.setContent(request.getContent());
        review.setRating(request.getRating());

        // 3. Gọi AI để phân tích nội dung với accuracy logic cho tiếng Việt
        try {
            NlpResponse aiResult = nlpService.analyzeSentimentWithUserRating(request.getContent(), request.getRating()).block();
            
            if (aiResult != null) {
                log.info("AI analysis successful for review: {}", aiResult.getSentiment());
                
                // Map kết quả AI vào Entity Review (cả cũ và mới)
                review.setSentiment(aiResult.getSentiment());
                review.setIsFake(aiResult.getIsFakeReview());
                review.setPriority(aiResult.getPriority());
                review.setHelpfulnessScore(aiResult.getHelpfulnessScore());
                
                // Đổ dữ liệu vào các trường AI mới (Option C)
                review.setAiSentiment(aiResult.getSentiment());
                review.setAiRating(aiResult.getRatingScore());
                review.setAiPriority(aiResult.getPriority());
                review.setAiPrimaryEmotion(aiResult.getPrimaryEmotion());
                
                // Lưu lại các tính năng gợi ý trích xuất bởi AI (nếu có)
                if (aiResult.getJustification() != null && !aiResult.getJustification().isEmpty()) {
                    log.debug("AI justification: {}", aiResult.getJustification());
                }
            } else {
                log.warn("AI analysis returned null result, using fallback values");
                setDefaultAiValues(review);
            }
        } catch (Exception e) {
            log.error("AI analysis failed, using fallback values. Error: {}", e.getMessage());
            setDefaultAiValues(review);
        }

        // 4. Lưu review vào database
        return reviewRepository.save(review);
    }

    /**
     * Set default AI values when NLP service fails
     */
    private void setDefaultAiValues(Review review) {
        review.setSentiment("Neutral");
        review.setIsFake(false);
        review.setPriority("LOW");
        review.setHelpfulnessScore(5);
        
        // Set default values cho các trường AI mới
        review.setAiSentiment("Neutral");
        review.setAiRating(3);
        review.setAiPriority("LOW");
        review.setAiPrimaryEmotion("Neutral");
        
        log.warn("AI FALLBACK: Applied default values due to NLP service failure");
    }

    private void checkVerifiedPurchase(Long userId, Long productId) {
        List<String> validStatuses = Arrays.asList("PAID", "SHIPPED", "DELIVERED");
        boolean hasPurchased = orderRepository.existsVerifiedPurchase(userId, productId, validStatuses);

        if (!hasPurchased) {
            throw new RuntimeException("Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã được thanh toán hoặc giao thành công.");
        }
    }
}
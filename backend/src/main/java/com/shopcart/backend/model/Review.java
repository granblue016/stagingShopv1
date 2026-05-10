package com.shopcart.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reviews")
@Data
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long productId;

    @Column(length = 1000)
    private String content; // Nội dung review từ frontend

    private Integer rating;

    // Các trường dữ liệu từ AI NLP-Service (giữ nguyên để tương thích)
    private String sentiment; // Positive, Negative, Neutral
    private Boolean isFake;
    private String priority; // CRITICAL, HIGH, LOW...
    private Integer helpfulnessScore;

    // Các trường AI mới để phân biệt với dữ liệu người dùng (Option C)
    @Column(name = "ai_sentiment")
    private String aiSentiment; // Positive, Negative, Neutral từ AI
    
    @Column(name = "ai_rating")
    private Integer aiRating; // Rating score từ AI (1-5)
    
    @Column(name = "ai_priority")
    private String aiPriority; // Priority từ AI (CRITICAL, HIGH, MEDIUM, LOW)
    
    @Column(name = "ai_primary_emotion")
    private String aiPrimaryEmotion; // Primary emotion từ AI (Joy, Anger, etc.)

    // TỐI ƯU: Lưu trữ các tính năng được AI trích xuất để làm thống kê sau này
    @ElementCollection
    @CollectionTable(name = "review_suggested_features", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "feature")
    @JsonIgnore
    private List<String> suggestedFeatures;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
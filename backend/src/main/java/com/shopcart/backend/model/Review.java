package com.shopcart.backend.model;

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

    // Các trường dữ liệu từ AI NLP-Service
    private String sentiment; // Positive, Negative, Neutral
    private Boolean isFake;
    private String priority; // CRITICAL, HIGH, LOW...
    private Integer helpfulnessScore;

    // TỐI ƯU: Lưu trữ các tính năng được AI trích xuất để làm thống kê sau này
    @ElementCollection
    @CollectionTable(name = "review_suggested_features", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "feature")
    private List<String> suggestedFeatures;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
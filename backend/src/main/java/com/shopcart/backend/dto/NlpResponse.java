package com.shopcart.backend.dto;

import lombok.Data;

/**
 * DTO for NLP Service response
 * Contains sentiment analysis results from AI
 */
@Data
public class NlpResponse {
    
    private String sentiment; // Positive, Negative, Neutral
    private Integer ratingScore; // 1-5 rating from AI
    private Boolean isFakeReview; // AI detection of fake review
    private String priority; // CRITICAL, HIGH, MEDIUM, LOW
    private Integer helpfulnessScore; // 1-10 score
    private String primaryEmotion; // Joy, Anger, Disappointment, etc.
    private String justification; // AI reasoning
    
    // Additional fields from NLP service (not stored in main entity)
    private String competitorMentioned;
    private Boolean needsSupport;
    private String technicalIssue;
}

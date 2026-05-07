package com.shopcart.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopcart.backend.dto.NlpResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Map;

/**
 * Official NLP Service for integrating with the NLP microservice
 * Handles sentiment analysis with fallback mechanisms
 */
@Slf4j
@Service
public class NlpService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String nlpServiceUrl;
    private static final Duration TIMEOUT = Duration.ofSeconds(15);

    public NlpService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper, 
                     @Value("${nlp.service.url:http://localhost:3001/analyze}") String nlpServiceUrl) {
        this.nlpServiceUrl = nlpServiceUrl;
        this.webClient = webClientBuilder
                .baseUrl(this.nlpServiceUrl)
                .build();
        this.objectMapper = objectMapper;
        log.info("NLP Service initialized with URL: {}", this.nlpServiceUrl);
    }

    /**
     * Analyze sentiment of review text
     * @param reviewText The text to analyze
     * @return NlpResponse with analysis results or default fallback
     */
    public Mono<NlpResponse> analyzeSentiment(String reviewText) {
        return analyzeSentimentWithUserRating(reviewText, null);
    }

    /**
     * Analyze sentiment with Vietnamese accuracy logic
     * @param reviewText The text to analyze
     * @param userRating User's rating (1-5) for accuracy correction
     * @return NlpResponse with analysis results or default fallback
     */
    public Mono<NlpResponse> analyzeSentimentWithUserRating(String reviewText, Integer userRating) {
        log.info("Bắt đầu phân tích sentiment cho review: \"{}\"", reviewText.substring(0, Math.min(100, reviewText.length())) + "...");
        
        Map<String, String> requestBody = Map.of("reviewText", reviewText);
        
        return webClient.post()
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(TIMEOUT)
                .retryWhen(Retry.backoff(2, Duration.ofSeconds(1))
                        .maxBackoff(Duration.ofSeconds(3))
                        .doBeforeRetry(retrySignal -> 
                            log.warn("Retry attempt {} for NLP service", retrySignal.totalRetries() + 1)))
                .map(responseBody -> this.parseNlpResponseWithAccuracyCheck(responseBody, userRating))
                .doOnSuccess(response -> log.info("Phân tích sentiment thành công: {}", response))
                .onErrorResume(throwable -> {
                    log.error("Lỗi khi phân tích sentiment, sử dụng fallback values. Lỗi: {}", throwable.getMessage());
                    return Mono.just(createDefaultNlpResponse());
                });
    }

    /**
     * Parse JSON response from NLP service
     */
    private NlpResponse parseNlpResponse(String responseBody) {
        return parseNlpResponseWithAccuracyCheck(responseBody, null);
    }

    /**
     * Parse JSON response with Vietnamese accuracy check
     */
    private NlpResponse parseNlpResponseWithAccuracyCheck(String responseBody, Integer userRating) {
        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            
            NlpResponse response = new NlpResponse();
            String aiSentiment = jsonNode.path("sentiment").asText("Neutral");
            int aiRating = jsonNode.path("rating_score").asInt(3);
            
            // Apply Vietnamese accuracy logic
            if (userRating != null && shouldApplyAccuracyCorrection(userRating, aiSentiment, aiRating)) {
                log.warn("VIETNAMESE ACCURACY CORRECTION: User rating={} vs AI sentiment={}, rating={}. Applying correction.", userRating, aiSentiment, aiRating);
                
                // Keep user's rating but mark for manual review
                response.setRatingScore(userRating);
                response.setSentiment(determineSentimentFromRating(userRating));
                response.setPriority("MANUAL_REVIEW");
                response.setJustification(String.format("AI accuracy correction applied: User gave %d stars but AI detected %s (%d stars). Marked for manual review.", userRating, aiSentiment, aiRating));
            } else {
                // Use AI results as-is
                response.setSentiment(aiSentiment);
                response.setRatingScore(aiRating);
                response.setPriority(jsonNode.path("priority").asText("LOW"));
                response.setJustification(jsonNode.path("justification").asText(""));
            }
            
            response.setIsFakeReview(jsonNode.path("is_fake_review").asBoolean(false));
            response.setHelpfulnessScore(jsonNode.path("helpfulness_score").asInt(5));
            response.setPrimaryEmotion(jsonNode.path("primary_emotion").asText("Neutral"));
            
            log.debug("Parsed NLP response with accuracy check: {}", response);
            return response;
            
        } catch (Exception e) {
            log.error("Lỗi khi parse response từ NLP service: {}", e.getMessage(), e);
            return createDefaultNlpResponse();
        }
    }

    /**
     * Check if accuracy correction should be applied for Vietnamese sentiment
     */
    private boolean shouldApplyAccuracyCorrection(int userRating, String aiSentiment, int aiRating) {
        // If user gives 4-5 stars but AI says negative, apply correction
        if (userRating >= 4 && "Negative".equalsIgnoreCase(aiSentiment)) {
            return true;
        }
        
        // If user gives 1-2 stars but AI says positive, apply correction
        if (userRating <= 2 && "Positive".equalsIgnoreCase(aiSentiment)) {
            return true;
        }
        
        // If there's a big discrepancy between user rating and AI rating
        if (Math.abs(userRating - aiRating) >= 3) {
            return true;
        }
        
        return false;
    }

    /**
     * Determine sentiment from user rating
     */
    private String determineSentimentFromRating(int rating) {
        if (rating >= 4) {
            return "Positive";
        } else if (rating <= 2) {
            return "Negative";
        } else {
            return "Neutral";
        }
    }

    /**
     * Create default fallback response when NLP service fails
     */
    private NlpResponse createDefaultNlpResponse() {
        log.warn("AI FALLBACK: Sử dụng giá trị mặc định do NLP service không khả dụng");
        
        NlpResponse fallback = new NlpResponse();
        fallback.setSentiment("Neutral");
        fallback.setRatingScore(3);
        fallback.setIsFakeReview(false);
        fallback.setPriority("LOW");
        fallback.setHelpfulnessScore(5);
        fallback.setPrimaryEmotion("Neutral");
        fallback.setJustification("AI service unavailable - using default values");
        
        return fallback;
    }

    /**
     * Check if NLP service is healthy
     */
    public Mono<Boolean> isHealthy() {
        return webClient.get()
                .uri("/health")
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(5))
                .map(response -> response.contains("\"status\":\"ok\""))
                .onErrorReturn(false);
    }
}

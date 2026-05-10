package com.shopcart.backend.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import java.time.LocalDateTime;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

class ReviewTest {

    private Review review;

    @BeforeEach
    void setUp() {
        review = new Review();
        review.setId(1L);
        review.setUserId(100L);
        review.setProductId(1L);
        review.setContent("Excellent product!");
        review.setRating(5);
        review.setSentiment("Positive");
        review.setIsFake(false);
        review.setPriority("HIGH");
        review.setHelpfulnessScore(10);
        review.setAiSentiment("Positive");
        review.setAiRating(5);
        review.setAiPriority("MEDIUM");
        review.setAiPrimaryEmotion("Joy");
        review.setSuggestedFeatures(Arrays.asList("quality", "value"));
        review.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testReviewNoArgsConstructor() {
        Review newReview = new Review();
        assertNotNull(newReview);
        assertNull(newReview.getId());
        assertNull(newReview.getUserId());
        assertNull(newReview.getProductId());
        assertNull(newReview.getContent());
        assertNull(newReview.getRating());
        assertNull(newReview.getSentiment());
        assertNull(newReview.getIsFake());
        assertNull(newReview.getPriority());
        assertNull(newReview.getHelpfulnessScore());
        assertNull(newReview.getAiSentiment());
        assertNull(newReview.getAiRating());
        assertNull(newReview.getAiPriority());
        assertNull(newReview.getAiPrimaryEmotion());
        assertNull(newReview.getSuggestedFeatures());
        assertNotNull(newReview.getCreatedAt()); // Should be set by default
    }

    @Test
    void testSettersAndGetters() {
        review.setUserId(200L);
        review.setProductId(2L);
        review.setContent("Updated review");
        review.setRating(3);
        review.setSentiment("Neutral");
        review.setIsFake(true);
        review.setPriority("CRITICAL");
        review.setHelpfulnessScore(5);
        review.setAiSentiment("Negative");
        review.setAiRating(2);
        review.setAiPriority("LOW");
        review.setAiPrimaryEmotion("Anger");
        review.setSuggestedFeatures(Arrays.asList("bad", "expensive"));

        assertEquals(200L, review.getUserId());
        assertEquals(2L, review.getProductId());
        assertEquals("Updated review", review.getContent());
        assertEquals(3, review.getRating());
        assertEquals("Neutral", review.getSentiment());
        assertTrue(review.getIsFake());
        assertEquals("CRITICAL", review.getPriority());
        assertEquals(5, review.getHelpfulnessScore());
        assertEquals("Negative", review.getAiSentiment());
        assertEquals(2, review.getAiRating());
        assertEquals("LOW", review.getAiPriority());
        assertEquals("Anger", review.getAiPrimaryEmotion());
        assertEquals(2, review.getSuggestedFeatures().size());
    }

    @Test
    void testToString() {
        String reviewString = review.toString();
        assertTrue(reviewString.contains("1"));
        assertTrue(reviewString.contains("Excellent product!"));
        assertTrue(reviewString.contains("5"));
    }

    @Test
    void testEqualsAndHashCode() {
        LocalDateTime sameTime = LocalDateTime.now();
        
        Review review1 = new Review();
        review1.setId(1L);
        review1.setUserId(100L);
        review1.setProductId(1L);
        review1.setRating(5);
        review1.setCreatedAt(sameTime);

        Review review2 = new Review();
        review2.setId(1L);
        review2.setUserId(100L);
        review2.setProductId(1L);
        review2.setRating(5);
        review2.setCreatedAt(sameTime);

        Review review3 = new Review();
        review3.setId(2L);
        review3.setUserId(100L);
        review3.setProductId(1L);
        review3.setRating(5);
        review3.setCreatedAt(sameTime);

        assertEquals(review1, review2);
        assertEquals(review1.hashCode(), review2.hashCode());
        assertNotEquals(review1, review3);
        assertNotEquals(review1.hashCode(), review3.hashCode());
    }

    @Test
    void testReviewWithNullValues() {
        Review nullReview = new Review();
        assertNull(nullReview.getUserId());
        assertNull(nullReview.getProductId());
        assertNull(nullReview.getContent());
        assertNull(nullReview.getRating());
        assertNull(nullReview.getSentiment());
        assertNull(nullReview.getIsFake());
        assertNull(nullReview.getPriority());
        assertNull(nullReview.getHelpfulnessScore());
        assertNull(nullReview.getAiSentiment());
        assertNull(nullReview.getAiRating());
        assertNull(nullReview.getAiPriority());
        assertNull(nullReview.getAiPrimaryEmotion());
        assertNull(nullReview.getSuggestedFeatures());
    }

    @Test
    void testReviewWithDifferentRatings() {
        Review oneStarReview = new Review();
        oneStarReview.setId(3L);
        oneStarReview.setUserId(100L);
        oneStarReview.setProductId(1L);
        oneStarReview.setRating(1);
        oneStarReview.setContent("Poor product");

        Review fiveStarReview = new Review();
        fiveStarReview.setId(4L);
        fiveStarReview.setUserId(100L);
        fiveStarReview.setProductId(1L);
        fiveStarReview.setRating(5);
        fiveStarReview.setContent("Excellent product");

        assertEquals(1, oneStarReview.getRating());
        assertEquals(5, fiveStarReview.getRating());
        assertEquals("Poor product", oneStarReview.getContent());
        assertEquals("Excellent product", fiveStarReview.getContent());
    }

    @Test
    void testReviewWithEmptyContent() {
        Review emptyContentReview = new Review();
        emptyContentReview.setId(5L);
        emptyContentReview.setUserId(100L);
        emptyContentReview.setProductId(1L);
        emptyContentReview.setRating(3);
        emptyContentReview.setContent("");

        assertEquals("", emptyContentReview.getContent());
        assertEquals(3, emptyContentReview.getRating());
    }

    @Test
    void testReviewWithAIFields() {
        Review aiReview = new Review();
        aiReview.setId(6L);
        aiReview.setUserId(100L);
        aiReview.setProductId(1L);
        aiReview.setAiSentiment("Positive");
        aiReview.setAiRating(4);
        aiReview.setAiPriority("HIGH");
        aiReview.setAiPrimaryEmotion("Satisfaction");
        aiReview.setSuggestedFeatures(Arrays.asList("design", "functionality"));

        assertEquals("Positive", aiReview.getAiSentiment());
        assertEquals(4, aiReview.getAiRating());
        assertEquals("HIGH", aiReview.getAiPriority());
        assertEquals("Satisfaction", aiReview.getAiPrimaryEmotion());
        assertEquals(2, aiReview.getSuggestedFeatures().size());
        assertTrue(aiReview.getSuggestedFeatures().contains("design"));
        assertTrue(aiReview.getSuggestedFeatures().contains("functionality"));
    }

    @Test
    void testReviewCreatedAt() {
        Review testReview = new Review();
        assertNotNull(testReview.getCreatedAt());
        assertTrue(testReview.getCreatedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
    }
}

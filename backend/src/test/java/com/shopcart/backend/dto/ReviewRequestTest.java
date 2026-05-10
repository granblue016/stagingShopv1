package com.shopcart.backend.dto;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class ReviewRequestTest {

    private ReviewRequest reviewRequest;

    @BeforeEach
    void setUp() {
        reviewRequest = new ReviewRequest();
        reviewRequest.setProductId(1L);
        reviewRequest.setContent("This is a great product with excellent quality and features!");
        reviewRequest.setRating(5);
        reviewRequest.setUserId(100L);
        reviewRequest.setAiSentiment("Positive");
        reviewRequest.setAiRating(5);
        reviewRequest.setAiPriority("MEDIUM");
        reviewRequest.setAiPrimaryEmotion("Joy");
    }

    @Test
    void testReviewRequestSettersAndGetters() {
        assertNotNull(reviewRequest);
        assertEquals(1L, reviewRequest.getProductId());
        assertEquals("This is a great product with excellent quality and features!", reviewRequest.getContent());
        assertEquals(5, reviewRequest.getRating());
        assertEquals(100L, reviewRequest.getUserId());
        assertEquals("Positive", reviewRequest.getAiSentiment());
        assertEquals(5, reviewRequest.getAiRating());
        assertEquals("MEDIUM", reviewRequest.getAiPriority());
        assertEquals("Joy", reviewRequest.getAiPrimaryEmotion());
    }

    @Test
    void testReviewRequestNoArgsConstructor() {
        ReviewRequest newReviewRequest = new ReviewRequest();
        assertNotNull(newReviewRequest);
        assertNull(newReviewRequest.getProductId());
        assertNull(newReviewRequest.getContent());
        assertNull(newReviewRequest.getRating());
        assertNull(newReviewRequest.getUserId());
        assertNull(newReviewRequest.getAiSentiment());
        assertNull(newReviewRequest.getAiRating());
        assertNull(newReviewRequest.getAiPriority());
        assertNull(newReviewRequest.getAiPrimaryEmotion());
    }

    @Test
    void testReviewRequestToString() {
        String reviewRequestString = reviewRequest.toString();
        assertTrue(reviewRequestString.contains("1"));
        assertTrue(reviewRequestString.contains("This is a great product"));
        assertTrue(reviewRequestString.contains("5"));
    }

    @Test
    void testReviewRequestEqualsAndHashCode() {
        ReviewRequest reviewRequest1 = new ReviewRequest();
        reviewRequest1.setProductId(1L);
        reviewRequest1.setContent("Great product!");
        reviewRequest1.setRating(5);

        ReviewRequest reviewRequest2 = new ReviewRequest();
        reviewRequest2.setProductId(1L);
        reviewRequest2.setContent("Great product!");
        reviewRequest2.setRating(5);

        ReviewRequest reviewRequest3 = new ReviewRequest();
        reviewRequest3.setProductId(2L);
        reviewRequest3.setContent("Great product!");
        reviewRequest3.setRating(5);

        assertEquals(reviewRequest1, reviewRequest2);
        assertEquals(reviewRequest1.hashCode(), reviewRequest2.hashCode());
        assertNotEquals(reviewRequest1, reviewRequest3);
        assertNotEquals(reviewRequest1.hashCode(), reviewRequest3.hashCode());
    }

    @Test
    void testReviewRequestWithNullValues() {
        ReviewRequest nullReviewRequest = new ReviewRequest();
        assertNull(nullReviewRequest.getProductId());
        assertNull(nullReviewRequest.getContent());
        assertNull(nullReviewRequest.getRating());
        assertNull(nullReviewRequest.getUserId());
        assertNull(nullReviewRequest.getAiSentiment());
        assertNull(nullReviewRequest.getAiRating());
        assertNull(nullReviewRequest.getAiPriority());
        assertNull(nullReviewRequest.getAiPrimaryEmotion());
    }

    @Test
    void testReviewRequestWithEmptyContent() {
        ReviewRequest emptyContentRequest = new ReviewRequest();
        emptyContentRequest.setProductId(1L);
        emptyContentRequest.setContent("");
        emptyContentRequest.setRating(3);

        assertEquals("", emptyContentRequest.getContent());
        assertEquals(1L, emptyContentRequest.getProductId());
        assertEquals(3, emptyContentRequest.getRating());
    }

    @Test
    void testReviewRequestWithDifferentRatings() {
        ReviewRequest oneStarRequest = new ReviewRequest();
        oneStarRequest.setProductId(1L);
        oneStarRequest.setContent("Poor product");
        oneStarRequest.setRating(1);

        ReviewRequest fiveStarRequest = new ReviewRequest();
        fiveStarRequest.setProductId(1L);
        fiveStarRequest.setContent("Excellent product");
        fiveStarRequest.setRating(5);

        assertEquals(1, oneStarRequest.getRating());
        assertEquals(5, fiveStarRequest.getRating());
        assertEquals("Poor product", oneStarRequest.getContent());
        assertEquals("Excellent product", fiveStarRequest.getContent());
    }

    @Test
    void testReviewRequestWithAIFields() {
        ReviewRequest aiReviewRequest = new ReviewRequest();
        aiReviewRequest.setProductId(2L);
        aiReviewRequest.setContent("Average product");
        aiReviewRequest.setRating(3);
        aiReviewRequest.setAiSentiment("Neutral");
        aiReviewRequest.setAiRating(3);
        aiReviewRequest.setAiPriority("LOW");
        aiReviewRequest.setAiPrimaryEmotion("Indifference");

        assertEquals("Neutral", aiReviewRequest.getAiSentiment());
        assertEquals(3, aiReviewRequest.getAiRating());
        assertEquals("LOW", aiReviewRequest.getAiPriority());
        assertEquals("Indifference", aiReviewRequest.getAiPrimaryEmotion());
    }

    @Test
    void testReviewRequestWithMinimumContent() {
        ReviewRequest minContentRequest = new ReviewRequest();
        minContentRequest.setProductId(1L);
        minContentRequest.setContent("1234567890"); // Exactly 10 characters
        minContentRequest.setRating(4);

        assertEquals("1234567890", minContentRequest.getContent());
        assertEquals(4, minContentRequest.getRating());
    }

    @Test
    void testReviewRequestWithLongContent() {
        String longContent = "This is a very long review content that exceeds the normal length and contains many words to test the handling of longer content in the review request object.";
        
        ReviewRequest longContentRequest = new ReviewRequest();
        longContentRequest.setProductId(1L);
        longContentRequest.setContent(longContent);
        longContentRequest.setRating(4);

        assertEquals(longContent, longContentRequest.getContent());
        assertEquals(4, longContentRequest.getRating());
    }

    @Test
    void testReviewRequestWithBoundaryRatings() {
        ReviewRequest minRatingRequest = new ReviewRequest();
        minRatingRequest.setProductId(1L);
        minRatingRequest.setContent("Minimum rating");
        minRatingRequest.setRating(1);

        ReviewRequest maxRatingRequest = new ReviewRequest();
        maxRatingRequest.setProductId(1L);
        maxRatingRequest.setContent("Maximum rating");
        maxRatingRequest.setRating(5);

        assertEquals(1, minRatingRequest.getRating());
        assertEquals(5, maxRatingRequest.getRating());
    }
}

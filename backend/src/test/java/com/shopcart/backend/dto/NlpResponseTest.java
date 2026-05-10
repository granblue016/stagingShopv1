package com.shopcart.backend.dto;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class NlpResponseTest {

    private NlpResponse nlpResponse;

    @BeforeEach
    void setUp() {
        nlpResponse = new NlpResponse();
        nlpResponse.setSentiment("Positive");
        nlpResponse.setRatingScore(5);
        nlpResponse.setIsFakeReview(false);
        nlpResponse.setPriority("MEDIUM");
        nlpResponse.setHelpfulnessScore(8);
        nlpResponse.setPrimaryEmotion("Joy");
        nlpResponse.setJustification("The review shows genuine satisfaction with the product");
        nlpResponse.setCompetitorMentioned("None");
        nlpResponse.setNeedsSupport(false);
        nlpResponse.setTechnicalIssue("None");
    }

    @Test
    void testNlpResponseSettersAndGetters() {
        assertNotNull(nlpResponse);
        assertEquals("Positive", nlpResponse.getSentiment());
        assertEquals(5, nlpResponse.getRatingScore());
        assertFalse(nlpResponse.getIsFakeReview());
        assertEquals("MEDIUM", nlpResponse.getPriority());
        assertEquals(8, nlpResponse.getHelpfulnessScore());
        assertEquals("Joy", nlpResponse.getPrimaryEmotion());
        assertEquals("The review shows genuine satisfaction with the product", nlpResponse.getJustification());
        assertEquals("None", nlpResponse.getCompetitorMentioned());
        assertFalse(nlpResponse.getNeedsSupport());
        assertEquals("None", nlpResponse.getTechnicalIssue());
    }

    @Test
    void testNlpResponseNoArgsConstructor() {
        NlpResponse newNlpResponse = new NlpResponse();
        assertNotNull(newNlpResponse);
        assertNull(newNlpResponse.getSentiment());
        assertNull(newNlpResponse.getRatingScore());
        assertNull(newNlpResponse.getIsFakeReview());
        assertNull(newNlpResponse.getPriority());
        assertNull(newNlpResponse.getHelpfulnessScore());
        assertNull(newNlpResponse.getPrimaryEmotion());
        assertNull(newNlpResponse.getJustification());
        assertNull(newNlpResponse.getCompetitorMentioned());
        assertNull(newNlpResponse.getNeedsSupport());
        assertNull(newNlpResponse.getTechnicalIssue());
    }

    @Test
    void testNlpResponseToString() {
        String nlpResponseString = nlpResponse.toString();
        assertTrue(nlpResponseString.contains("Positive"));
        assertTrue(nlpResponseString.contains("MEDIUM"));
        assertTrue(nlpResponseString.contains("8"));
    }

    @Test
    void testNlpResponseEqualsAndHashCode() {
        NlpResponse nlpResponse1 = new NlpResponse();
        nlpResponse1.setSentiment("Positive");
        nlpResponse1.setRatingScore(5);
        nlpResponse1.setIsFakeReview(false);
        nlpResponse1.setPriority("MEDIUM");
        nlpResponse1.setHelpfulnessScore(8);

        NlpResponse nlpResponse2 = new NlpResponse();
        nlpResponse2.setSentiment("Positive");
        nlpResponse2.setRatingScore(5);
        nlpResponse2.setIsFakeReview(false);
        nlpResponse2.setPriority("MEDIUM");
        nlpResponse2.setHelpfulnessScore(8);

        NlpResponse nlpResponse3 = new NlpResponse();
        nlpResponse3.setSentiment("Negative");
        nlpResponse3.setRatingScore(2);
        nlpResponse3.setIsFakeReview(false);
        nlpResponse3.setPriority("MEDIUM");
        nlpResponse3.setHelpfulnessScore(8);

        assertEquals(nlpResponse1, nlpResponse2);
        assertEquals(nlpResponse1.hashCode(), nlpResponse2.hashCode());
        assertNotEquals(nlpResponse1, nlpResponse3);
        assertNotEquals(nlpResponse1.hashCode(), nlpResponse3.hashCode());
    }

    @Test
    void testNlpResponseWithNullValues() {
        NlpResponse nullNlpResponse = new NlpResponse();
        assertNull(nullNlpResponse.getSentiment());
        assertNull(nullNlpResponse.getRatingScore());
        assertNull(nullNlpResponse.getIsFakeReview());
        assertNull(nullNlpResponse.getPriority());
        assertNull(nullNlpResponse.getHelpfulnessScore());
        assertNull(nullNlpResponse.getPrimaryEmotion());
        assertNull(nullNlpResponse.getJustification());
        assertNull(nullNlpResponse.getCompetitorMentioned());
        assertNull(nullNlpResponse.getNeedsSupport());
        assertNull(nullNlpResponse.getTechnicalIssue());
    }

    @Test
    void testNlpResponseWithDifferentSentiments() {
        NlpResponse positiveResponse = new NlpResponse();
        positiveResponse.setSentiment("Positive");
        positiveResponse.setIsFakeReview(false);

        NlpResponse negativeResponse = new NlpResponse();
        negativeResponse.setSentiment("Negative");
        negativeResponse.setIsFakeReview(false);

        NlpResponse neutralResponse = new NlpResponse();
        neutralResponse.setSentiment("Neutral");
        neutralResponse.setIsFakeReview(false);

        assertEquals("Positive", positiveResponse.getSentiment());
        assertEquals("Negative", negativeResponse.getSentiment());
        assertEquals("Neutral", neutralResponse.getSentiment());
        assertFalse(positiveResponse.getIsFakeReview());
        assertFalse(negativeResponse.getIsFakeReview());
        assertFalse(neutralResponse.getIsFakeReview());
    }

    @Test
    void testNlpResponseWithFakeDetection() {
        NlpResponse fakeResponse = new NlpResponse();
        fakeResponse.setSentiment("Positive");
        fakeResponse.setIsFakeReview(true);
        fakeResponse.setPriority("CRITICAL");

        NlpResponse realResponse = new NlpResponse();
        realResponse.setSentiment("Positive");
        realResponse.setIsFakeReview(false);
        realResponse.setPriority("LOW");

        assertTrue(fakeResponse.getIsFakeReview());
        assertFalse(realResponse.getIsFakeReview());
        assertEquals("CRITICAL", fakeResponse.getPriority());
        assertEquals("LOW", realResponse.getPriority());
    }

    @Test
    void testNlpResponseWithBoundaryScores() {
        NlpResponse minScoreResponse = new NlpResponse();
        minScoreResponse.setHelpfulnessScore(0);
        minScoreResponse.setRatingScore(1);

        NlpResponse maxScoreResponse = new NlpResponse();
        maxScoreResponse.setHelpfulnessScore(10);
        maxScoreResponse.setRatingScore(5);

        assertEquals(0, minScoreResponse.getHelpfulnessScore());
        assertEquals(1, minScoreResponse.getRatingScore());
        assertEquals(10, maxScoreResponse.getHelpfulnessScore());
        assertEquals(5, maxScoreResponse.getRatingScore());
    }

    @Test
    void testNlpResponseWithDifferentPriorities() {
        NlpResponse criticalResponse = new NlpResponse();
        criticalResponse.setPriority("CRITICAL");

        NlpResponse highResponse = new NlpResponse();
        highResponse.setPriority("HIGH");

        NlpResponse mediumResponse = new NlpResponse();
        mediumResponse.setPriority("MEDIUM");

        NlpResponse lowResponse = new NlpResponse();
        lowResponse.setPriority("LOW");

        assertEquals("CRITICAL", criticalResponse.getPriority());
        assertEquals("HIGH", highResponse.getPriority());
        assertEquals("MEDIUM", mediumResponse.getPriority());
        assertEquals("LOW", lowResponse.getPriority());
    }

    @Test
    void testNlpResponseWithDifferentEmotions() {
        NlpResponse joyResponse = new NlpResponse();
        joyResponse.setPrimaryEmotion("Joy");

        NlpResponse angerResponse = new NlpResponse();
        angerResponse.setPrimaryEmotion("Anger");

        NlpResponse sadnessResponse = new NlpResponse();
        sadnessResponse.setPrimaryEmotion("Sadness");

        NlpResponse disappointmentResponse = new NlpResponse();
        disappointmentResponse.setPrimaryEmotion("Disappointment");

        assertEquals("Joy", joyResponse.getPrimaryEmotion());
        assertEquals("Anger", angerResponse.getPrimaryEmotion());
        assertEquals("Sadness", sadnessResponse.getPrimaryEmotion());
        assertEquals("Disappointment", disappointmentResponse.getPrimaryEmotion());
    }

    @Test
    void testNlpResponseWithAdditionalFields() {
        NlpResponse additionalFieldsResponse = new NlpResponse();
        additionalFieldsResponse.setCompetitorMentioned("Competitor X");
        additionalFieldsResponse.setNeedsSupport(true);
        additionalFieldsResponse.setTechnicalIssue("Login issue");

        assertEquals("Competitor X", additionalFieldsResponse.getCompetitorMentioned());
        assertTrue(additionalFieldsResponse.getNeedsSupport());
        assertEquals("Login issue", additionalFieldsResponse.getTechnicalIssue());
    }

    @Test
    void testNlpResponseWithJustification() {
        NlpResponse justificationResponse = new NlpResponse();
        justificationResponse.setJustification("The review contains specific details about product usage and shows genuine experience");

        assertEquals("The review contains specific details about product usage and shows genuine experience", 
                justificationResponse.getJustification());
    }
}

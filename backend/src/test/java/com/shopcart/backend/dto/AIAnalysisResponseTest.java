package com.shopcart.backend.dto;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class AIAnalysisResponseTest {

    private AIAnalysisResponse aiAnalysisResponse;

    @BeforeEach
    void setUp() {
        aiAnalysisResponse = new AIAnalysisResponse();
        aiAnalysisResponse.setSentiment("Positive");
        aiAnalysisResponse.setFake(false);
        aiAnalysisResponse.setPriority("MEDIUM");
        aiAnalysisResponse.setHelpfulnessScore(8);
        aiAnalysisResponse.setSuggestedFeatures(Arrays.asList("quality", "value", "design"));
        
        Map<String, String> aspects = new HashMap<>();
        aspects.put("pin", "Tốt");
        aspects.put("manHinh", "Ổn");
        aspects.put("giai", "Rất tốt");
        aiAnalysisResponse.setAspects(aspects);
    }

    @Test
    void testAIAnalysisResponseSettersAndGetters() {
        assertNotNull(aiAnalysisResponse);
        assertEquals("Positive", aiAnalysisResponse.getSentiment());
        assertFalse(aiAnalysisResponse.isFake());
        assertEquals("MEDIUM", aiAnalysisResponse.getPriority());
        assertEquals(8, aiAnalysisResponse.getHelpfulnessScore());
        assertEquals(Arrays.asList("quality", "value", "design"), aiAnalysisResponse.getSuggestedFeatures());
        assertEquals("Tốt", aiAnalysisResponse.getAspects().get("pin"));
        assertEquals("Ổn", aiAnalysisResponse.getAspects().get("manHinh"));
        assertEquals("Rất tốt", aiAnalysisResponse.getAspects().get("giai"));
    }

    @Test
    void testAIAnalysisResponseNoArgsConstructor() {
        AIAnalysisResponse newAIAnalysisResponse = new AIAnalysisResponse();
        assertNotNull(newAIAnalysisResponse);
        assertNull(newAIAnalysisResponse.getSentiment());
        assertNull(newAIAnalysisResponse.isFake());
        assertNull(newAIAnalysisResponse.getPriority());
        assertNull(newAIAnalysisResponse.getHelpfulnessScore());
        assertNull(newAIAnalysisResponse.getSuggestedFeatures());
        assertNull(newAIAnalysisResponse.getAspects());
    }

    @Test
    void testAIAnalysisResponseToString() {
        String aiAnalysisResponseString = aiAnalysisResponse.toString();
        assertTrue(aiAnalysisResponseString.contains("Positive"));
        assertTrue(aiAnalysisResponseString.contains("8"));
        assertTrue(aiAnalysisResponseString.contains("quality"));
    }

    @Test
    void testAIAnalysisResponseEqualsAndHashCode() {
        AIAnalysisResponse aiAnalysisResponse1 = new AIAnalysisResponse();
        aiAnalysisResponse1.setSentiment("Positive");
        aiAnalysisResponse1.setFake(false);
        aiAnalysisResponse1.setPriority("MEDIUM");
        aiAnalysisResponse1.setHelpfulnessScore(8);
        aiAnalysisResponse1.setSuggestedFeatures(Arrays.asList("quality"));

        AIAnalysisResponse aiAnalysisResponse2 = new AIAnalysisResponse();
        aiAnalysisResponse2.setSentiment("Positive");
        aiAnalysisResponse2.setFake(false);
        aiAnalysisResponse2.setPriority("MEDIUM");
        aiAnalysisResponse2.setHelpfulnessScore(8);
        aiAnalysisResponse2.setSuggestedFeatures(Arrays.asList("quality"));

        AIAnalysisResponse aiAnalysisResponse3 = new AIAnalysisResponse();
        aiAnalysisResponse3.setSentiment("Negative");
        aiAnalysisResponse3.setFake(true);
        aiAnalysisResponse3.setPriority("HIGH");
        aiAnalysisResponse3.setHelpfulnessScore(2);
        aiAnalysisResponse3.setSuggestedFeatures(Arrays.asList("poor"));

        assertEquals(aiAnalysisResponse1, aiAnalysisResponse2);
        assertEquals(aiAnalysisResponse1.hashCode(), aiAnalysisResponse2.hashCode());
        assertNotEquals(aiAnalysisResponse1, aiAnalysisResponse3);
        assertNotEquals(aiAnalysisResponse1.hashCode(), aiAnalysisResponse3.hashCode());
    }

    @Test
    void testAIAnalysisResponseWithNullValues() {
        AIAnalysisResponse nullAIAnalysisResponse = new AIAnalysisResponse();
        assertNull(nullAIAnalysisResponse.getSentiment());
        assertNull(nullAIAnalysisResponse.isFake());
        assertNull(nullAIAnalysisResponse.getPriority());
        assertNull(nullAIAnalysisResponse.getHelpfulnessScore());
        assertNull(nullAIAnalysisResponse.getSuggestedFeatures());
        assertNull(nullAIAnalysisResponse.getAspects());
    }

    @Test
    void testAIAnalysisResponseWithDifferentSentiments() {
        AIAnalysisResponse positiveResponse = new AIAnalysisResponse();
        positiveResponse.setSentiment("Positive");
        positiveResponse.setFake(false);

        AIAnalysisResponse negativeResponse = new AIAnalysisResponse();
        negativeResponse.setSentiment("Negative");
        negativeResponse.setFake(true);

        AIAnalysisResponse neutralResponse = new AIAnalysisResponse();
        neutralResponse.setSentiment("Neutral");
        neutralResponse.setFake(false);

        assertEquals("Positive", positiveResponse.getSentiment());
        assertEquals("Negative", negativeResponse.getSentiment());
        assertEquals("Neutral", neutralResponse.getSentiment());
        assertFalse(positiveResponse.isFake());
        assertTrue(negativeResponse.isFake());
        assertFalse(neutralResponse.isFake());
    }

    @Test
    void testAIAnalysisResponseWithDifferentPriorities() {
        AIAnalysisResponse criticalResponse = new AIAnalysisResponse();
        criticalResponse.setPriority("CRITICAL");

        AIAnalysisResponse highResponse = new AIAnalysisResponse();
        highResponse.setPriority("HIGH");

        AIAnalysisResponse mediumResponse = new AIAnalysisResponse();
        mediumResponse.setPriority("MEDIUM");

        AIAnalysisResponse lowResponse = new AIAnalysisResponse();
        lowResponse.setPriority("LOW");

        assertEquals("CRITICAL", criticalResponse.getPriority());
        assertEquals("HIGH", highResponse.getPriority());
        assertEquals("MEDIUM", mediumResponse.getPriority());
        assertEquals("LOW", lowResponse.getPriority());
    }

    @Test
    void testAIAnalysisResponseWithBoundaryScores() {
        AIAnalysisResponse minScoreResponse = new AIAnalysisResponse();
        minScoreResponse.setHelpfulnessScore(0);

        AIAnalysisResponse maxScoreResponse = new AIAnalysisResponse();
        maxScoreResponse.setHelpfulnessScore(10);

        assertEquals(0, minScoreResponse.getHelpfulnessScore());
        assertEquals(10, maxScoreResponse.getHelpfulnessScore());
    }

    @Test
    void testAIAnalysisResponseWithSuggestedFeatures() {
        AIAnalysisResponse featuresResponse = new AIAnalysisResponse();
        List<String> features = Arrays.asList("design", "quality", "price", "customer service", "shipping");
        featuresResponse.setSuggestedFeatures(features);

        assertEquals(features, featuresResponse.getSuggestedFeatures());
        assertEquals(5, featuresResponse.getSuggestedFeatures().size());
        assertTrue(featuresResponse.getSuggestedFeatures().contains("design"));
        assertTrue(featuresResponse.getSuggestedFeatures().contains("quality"));
        assertTrue(featuresResponse.getSuggestedFeatures().contains("price"));
    }

    @Test
    void testAIAnalysisResponseWithEmptySuggestedFeatures() {
        AIAnalysisResponse emptyFeaturesResponse = new AIAnalysisResponse();
        emptyFeaturesResponse.setSuggestedFeatures(Arrays.asList());

        assertEquals(Arrays.asList(), emptyFeaturesResponse.getSuggestedFeatures());
        assertEquals(0, emptyFeaturesResponse.getSuggestedFeatures().size());
    }

    @Test
    void testAIAnalysisResponseWithAspects() {
        AIAnalysisResponse aspectsResponse = new AIAnalysisResponse();
        Map<String, String> aspects = new HashMap<>();
        aspects.put("chatluong", "Tốt");
        aspects.put("mausac", "Đẹp");
        aspects.put("gia", "Hợp lý");
        aspectsResponse.setAspects(aspects);

        assertEquals(aspects, aspectsResponse.getAspects());
        assertEquals(3, aspectsResponse.getAspects().size());
        assertEquals("Tốt", aspectsResponse.getAspects().get("chatluong"));
        assertEquals("Đẹp", aspectsResponse.getAspects().get("mausac"));
        assertEquals("Hợp lý", aspectsResponse.getAspects().get("gia"));
    }

    @Test
    void testAIAnalysisResponseWithEmptyAspects() {
        AIAnalysisResponse emptyAspectsResponse = new AIAnalysisResponse();
        emptyAspectsResponse.setAspects(new HashMap<>());

        assertEquals(new HashMap<>(), emptyAspectsResponse.getAspects());
        assertEquals(0, emptyAspectsResponse.getAspects().size());
    }

    @Test
    void testAIAnalysisResponseWithNullAspects() {
        AIAnalysisResponse nullAspectsResponse = new AIAnalysisResponse();
        nullAspectsResponse.setAspects(null);

        assertNull(nullAspectsResponse.getAspects());
    }

    @Test
    void testAIAnalysisResponseWithNegativeScore() {
        AIAnalysisResponse negativeScoreResponse = new AIAnalysisResponse();
        negativeScoreResponse.setHelpfulnessScore(-5);

        assertEquals(-5, negativeScoreResponse.getHelpfulnessScore());
    }

    @Test
    void testAIAnalysisResponseWithHighScore() {
        AIAnalysisResponse highScoreResponse = new AIAnalysisResponse();
        highScoreResponse.setHelpfulnessScore(100);

        assertEquals(100, highScoreResponse.getHelpfulnessScore());
    }
}

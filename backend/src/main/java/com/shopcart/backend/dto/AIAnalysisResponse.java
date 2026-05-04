package com.shopcart.backend.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AIAnalysisResponse {
    private String sentiment; // Positive, Negative, Neutral
    private boolean isFake;
    private String priority; // CRITICAL, HIGH, MEDIUM, LOW
    private int helpfulnessScore;
    private List<String> suggestedFeatures;
    private Map<String, String> aspects; // { "pin": "Tốt", "manHinh": "Ổn" }
}
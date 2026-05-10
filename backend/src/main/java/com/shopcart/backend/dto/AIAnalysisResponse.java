package com.shopcart.backend.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AIAnalysisResponse {
    private String sentiment; // Positive, Negative, Neutral
    private Boolean fake;
    private String priority; // CRITICAL, HIGH, MEDIUM, LOW
    private Integer helpfulnessScore;
    private List<String> suggestedFeatures;
    private Map<String, String> aspects; // { "pin": "Tốt", "manHinh": "Ổn" }
}
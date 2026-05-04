package com.shopcart.backend.service;

import com.shopcart.backend.dto.AIAnalysisResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class NLPServiceClient {
    // Địa chỉ của node-service xử lý NLP (AI Lab)
    private final String AI_SERVICE_URL = "http://localhost:3000/analyze";

    public AIAnalysisResponse analyzeReview(String content) {
        RestTemplate restTemplate = new RestTemplate();

        try {
            // Gửi text sang AI service và nhận về kết quả map trực tiếp vào DTO
            return restTemplate.postForObject(
                    AI_SERVICE_URL,
                    Map.of("text", content),
                    AIAnalysisResponse.class
            );
        } catch (Exception e) {
            // Trường hợp AI Service sập, trả về kết quả mặc định để không làm hỏng trải nghiệm người dùng
            AIAnalysisResponse fallback = new AIAnalysisResponse();
            fallback.setSentiment("Neutral");
            fallback.setFake(false);
            fallback.setPriority("LOW");
            return fallback;
        }
    }
}
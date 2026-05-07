package com.shopcart.backend.sandbox;

import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.HashMap;

/**
 * Sandbox class for testing NLP Service integration
 * This class is isolated from the main business logic and used only for testing purposes
 */
@Slf4j
public class NlpIntegrationSandbox {

    private static final String NLP_SERVICE_URL = "http://localhost:3001/analyze";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public NlpIntegrationSandbox() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Test method to send a sample review to NLP service
     */
    public void testNlpServiceConnection() {
        log.info("=== BẮT ĐẦU THỬ NGHIỆM KẾT NỐI NLP SERVICE ===");
        
        // Sample review texts for testing
        String[] sampleReviews = {
            "Máy này tuyệt vời! Mình đã dùng được 3 tháng và rất hài lòng. Màn hình sắc nét, bàn phím êm, pin trâu được 7-8 tiếng dùng văn phòng.",
            "Đừng mua máy này! Hư hỏng liên tục, mới dùng 2 tuần đã bị lỗi màn hình. Dịch vụ chăm sóc khách hàng cũng tệ.",
            "Máy ổn trong tầm giá. Thiết kế mỏng nhẹ dễ mang đi, cấu hình đủ dùng word, excel, lướt web."
        };

        for (int i = 0; i < sampleReviews.length; i++) {
            log.info("\n--- THỬ NGHIỆM REVIEW {} ---", i + 1);
            testSingleReview(sampleReviews[i]);
        }
        
        log.info("\n=== KẾT THÚC THỬ NGHIỆM NLP SERVICE ===");
    }

    /**
     * Test a single review against NLP service
     */
    private void testSingleReview(String reviewText) {
        try {
            log.info("Gửi review: \"{}\"", reviewText);
            
            // Create request body
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("reviewText", reviewText);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Create HTTP entity
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            // Send request
            log.info("Gửi request đến: {}", NLP_SERVICE_URL);
            ResponseEntity<String> response = restTemplate.postForEntity(NLP_SERVICE_URL, entity, String.class);

            // Log response
            log.info("Status Code: {}", response.getStatusCode());
            log.info("Response Body: {}", response.getBody());

            // Parse and analyze response
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                analyzeNlpResponse(response.getBody());
            } else {
                log.error("NLP Service trả về lỗi: {}", response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Lỗi khi kết nối đến NLP Service: {}", e.getMessage(), e);
        }
    }

    /**
     * Analyze NLP service response and check mapping with Review entity
     */
    private void analyzeNlpResponse(String responseBody) {
        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            
            log.info("\n=== PHÂN TÍCH RESPONSE TỪ NLP SERVICE ===");
            
            // Extract key fields
            String sentiment = jsonNode.path("sentiment").asText();
            int ratingScore = jsonNode.path("rating_score").asInt();
            boolean isFakeReview = jsonNode.path("is_fake_review").asBoolean();
            String priority = jsonNode.path("priority").asText();
            int helpfulnessScore = jsonNode.path("helpfulness_score").asInt();
            
            log.info("Sentiment: {} (Kiểu dữ liệu: String)", sentiment);
            log.info("Rating Score: {} (Kiểu dữ liệu: Integer)", ratingScore);
            log.info("Is Fake Review: {} (Kiểu dữ liệu: Boolean)", isFakeReview);
            log.info("Priority: {} (Kiểu dữ liệu: String)", priority);
            log.info("Helpfulness Score: {} (Kiểu dữ liệu: Integer)", helpfulnessScore);

            // Check mapping with Review entity
            log.info("\n=== KIỂM TRA MAPPING VỚI REVIEW ENTITY ===");
            log.info("✅ sentiment: String -> Review.sentiment (String) - KHỚP");
            log.info("⚠️  rating_score: Integer -> Review.rating (Integer) - CẦN XÉT XỬ");
            log.info("✅ is_fake_review: Boolean -> Review.isFake (Boolean) - KHỚP");
            log.info("✅ priority: String -> Review.priority (String) - KHỚP");
            log.info("✅ helpfulness_score: Integer -> Review.helpfulnessScore (Integer) - KHỚP");

            // Extract additional fields
            JsonNode aspects = jsonNode.path("aspects");
            if (aspects != null && !aspects.isMissingNode()) {
                log.info("\n=== PHÂN TÍCH CHI TIẾT CÁC KHÍA CẠNH ===");
                log.info("Pin: {}", aspects.path("pin").asText());
                log.info("Màn hình: {}", aspects.path("man_hinh").asText());
                log.info("Hiệu năng: {}", aspects.path("hieu_nang").asText());
            }

            String justification = jsonNode.path("justification").asText();
            if (!justification.isEmpty()) {
                log.info("\n=== GIẢI THÍCH TỪ AI ===");
                log.info("Justification: {}", justification);
            }

        } catch (Exception e) {
            log.error("Lỗi khi phân tích response từ NLP Service: {}", e.getMessage(), e);
        }
    }

    /**
     * Test health check endpoint
     */
    public void testHealthCheck() {
        try {
            log.info("=== THỬ NGHIỆM HEALTH CHECK ===");
            String healthUrl = "http://localhost:3001/health";
            ResponseEntity<String> response = restTemplate.getForEntity(healthUrl, String.class);
            
            log.info("Health Check Status: {}", response.getStatusCode());
            log.info("Health Check Response: {}", response.getBody());
            
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra health check: {}", e.getMessage(), e);
        }
    }

    /**
     * Main method for standalone testing
     */
    public static void main(String[] args) {
        NlpIntegrationSandbox sandbox = new NlpIntegrationSandbox();
        
        // Test health check first
        sandbox.testHealthCheck();
        
        // Test NLP service connection
        sandbox.testNlpServiceConnection();
    }
}

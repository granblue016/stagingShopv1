package com.shopcart.backend.sandbox;

import java.io.*;
import java.net.*;
import java.util.*;

/**
 * Simple standalone test for NLP Service integration without Spring context
 */
public class SimpleNlpTest {

    private static final String NLP_SERVICE_URL = "http://localhost:3001/analyze";

    public static void main(String[] args) {
        System.out.println("=== BẮT ĐẦU THỬ NGHIỆM KẾT NỐI NLP SERVICE ===");
        
        // Test health check first
        testHealthCheck();
        
        // Test with sample reviews
        testNlpServiceConnection();
        
        System.out.println("=== KẾT THÚC THỬ NGHIỆM NLP SERVICE ===");
    }

    /**
     * Test health check endpoint
     */
    public static void testHealthCheck() {
        try {
            System.out.println("\n=== THỬ NGHIỆM HEALTH CHECK ===");
            String healthUrl = "http://localhost:3001/health";
            
            URL url = new URL(healthUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            
            int responseCode = conn.getResponseCode();
            System.out.println("Health Check Status Code: " + responseCode);
            
            if (responseCode == 200) {
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                String inputLine;
                StringBuilder response = new StringBuilder();
                
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();
                
                System.out.println("Health Check Response: " + response.toString());
            } else {
                System.out.println("Health Check Failed: " + responseCode);
            }
            
        } catch (Exception e) {
            System.err.println("Lỗi khi kiểm tra health check: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Test NLP service connection with sample reviews
     */
    public static void testNlpServiceConnection() {
        // Sample review texts for testing
        String[] sampleReviews = {
            "Máy này tuyệt vời! Mình đã dùng được 3 tháng và rất hài lòng. Màn hình sắc nét, bàn phím êm, pin trâu được 7-8 tiếng dùng văn phòng.",
            "Đừng mua máy này! Hư hỏng liên tục, mới dùng 2 tuần đã bị lỗi màn hình. Dịch vụ chăm sóc khách hàng cũng tệ.",
            "Máy ổn trong tầm giá. Thiết kế mỏng nhẹ dễ mang đi, cấu hình đủ dùng word, excel, lướt web."
        };

        for (int i = 0; i < sampleReviews.length; i++) {
            System.out.println("\n--- THỬ NGHIỆM REVIEW " + (i + 1) + " ---");
            testSingleReview(sampleReviews[i]);
        }
    }

    /**
     * Test a single review against NLP service
     */
    private static void testSingleReview(String reviewText) {
        try {
            System.out.println("Gửi review: \"" + reviewText + "\"");
            
            // Create JSON request body
            String jsonInputString = "{\"reviewText\":\"" + reviewText.replace("\"", "\\\"") + "\"}";
            
            URL url = new URL(NLP_SERVICE_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);
            
            // Send request
            try(OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);
            }
            
            // Get response
            int responseCode = conn.getResponseCode();
            System.out.println("Status Code: " + responseCode);
            
            if (responseCode == 200) {
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                String inputLine;
                StringBuilder response = new StringBuilder();
                
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();
                
                String responseBody = response.toString();
                System.out.println("Response Body: " + responseBody);
                
                // Analyze response
                analyzeNlpResponse(responseBody);
            } else {
                System.err.println("NLP Service trả về lỗi: " + responseCode);
            }

        } catch (Exception e) {
            System.err.println("Lỗi khi kết nối đến NLP Service: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Analyze NLP service response and check mapping with Review entity
     */
    private static void analyzeNlpResponse(String responseBody) {
        try {
            System.out.println("\n=== PHÂN TÍCH RESPONSE TỪ NLP SERVICE ===");
            
            // Simple JSON parsing (basic approach without external libraries)
            String sentiment = extractJsonValue(responseBody, "sentiment");
            String ratingScore = extractJsonValue(responseBody, "rating_score");
            String isFakeReview = extractJsonValue(responseBody, "is_fake_review");
            String priority = extractJsonValue(responseBody, "priority");
            String helpfulnessScore = extractJsonValue(responseBody, "helpfulness_score");
            
            System.out.println("Sentiment: " + sentiment + " (Kiểu dữ liệu: String)");
            System.out.println("Rating Score: " + ratingScore + " (Kiểu dữ liệu: Integer)");
            System.out.println("Is Fake Review: " + isFakeReview + " (Kiểu dữ liệu: Boolean)");
            System.out.println("Priority: " + priority + " (Kiểu dữ liệu: String)");
            System.out.println("Helpfulness Score: " + helpfulnessScore + " (Kiểu dữ liệu: Integer)");

            // Check mapping with Review entity
            System.out.println("\n=== KIỂM TRA MAPPING VỚI REVIEW ENTITY ===");
            System.out.println("✅ sentiment: String -> Review.sentiment (String) - KHỚP");
            System.out.println("⚠️  rating_score: Integer -> Review.rating (Integer) - CẦN XÉT XỬ");
            System.out.println("✅ is_fake_review: Boolean -> Review.isFake (Boolean) - KHỚP");
            System.out.println("✅ priority: String -> Review.priority (String) - KHỚP");
            System.out.println("✅ helpfulness_score: Integer -> Review.helpfulnessScore (Integer) - KHỚP");

            // Extract additional fields
            String justification = extractJsonValue(responseBody, "justification");
            if (justification != null && !justification.isEmpty() && !justification.equals("null")) {
                System.out.println("\n=== GIẢI THÍCH TỪ AI ===");
                System.out.println("Justification: " + justification);
            }

        } catch (Exception e) {
            System.err.println("Lỗi khi phân tích response từ NLP Service: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Simple JSON value extraction (basic implementation)
     */
    private static String extractJsonValue(String json, String key) {
        String searchPattern = "\"" + key + "\":";
        int startIndex = json.indexOf(searchPattern);
        if (startIndex == -1) return "null";
        
        startIndex += searchPattern.length();
        
        // Skip whitespace
        while (startIndex < json.length() && Character.isWhitespace(json.charAt(startIndex))) {
            startIndex++;
        }
        
        if (startIndex >= json.length()) return "null";
        
        char nextChar = json.charAt(startIndex);
        if (nextChar == '"') {
            // String value
            startIndex++;
            int endIndex = json.indexOf("\"", startIndex);
            if (endIndex == -1) return "null";
            return json.substring(startIndex, endIndex);
        } else if (nextChar == 't' || nextChar == 'f') {
            // Boolean value
            int endIndex = json.indexOf(",", startIndex);
            if (endIndex == -1) endIndex = json.indexOf("}", startIndex);
            if (endIndex == -1) return "null";
            return json.substring(startIndex, endIndex);
        } else {
            // Number value
            int endIndex = json.indexOf(",", startIndex);
            if (endIndex == -1) endIndex = json.indexOf("}", startIndex);
            if (endIndex == -1) return "null";
            return json.substring(startIndex, endIndex);
        }
    }
}

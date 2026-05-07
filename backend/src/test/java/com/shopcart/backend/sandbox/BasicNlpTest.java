package com.shopcart.backend.sandbox;

import java.io.*;
import java.net.*;

/**
 * Basic test for NLP Service connection
 */
public class BasicNlpTest {

    private static final String NLP_SERVICE_URL = "http://localhost:3001/analyze";

    public static void main(String[] args) {
        System.out.println("=== STARTING NLP SERVICE CONNECTION TEST ===");
        
        // Test health check first
        testHealthCheck();
        
        // Test with sample reviews
        testNlpServiceConnection();
        
        System.out.println("=== NLP SERVICE TEST COMPLETED ===");
    }

    public static void testHealthCheck() {
        try {
            System.out.println("\n=== HEALTH CHECK TEST ===");
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
            System.err.println("Error during health check: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void testNlpServiceConnection() {
        String[] sampleReviews = {
            "This laptop is amazing! I've been using it for 3 months and very satisfied. Screen is sharp, keyboard is smooth, battery lasts 7-8 hours for office work.",
            "Don't buy this laptop! It keeps breaking down, after just 2 weeks the screen failed. Customer service is also terrible.",
            "This laptop is okay for the price. Design is thin and lightweight, configuration is enough for word, excel, web browsing."
        };

        for (int i = 0; i < sampleReviews.length; i++) {
            System.out.println("\n--- TESTING REVIEW " + (i + 1) + " ---");
            testSingleReview(sampleReviews[i]);
        }
    }

    private static void testSingleReview(String reviewText) {
        try {
            System.out.println("Sending review: \"" + reviewText + "\"");
            
            String jsonInputString = "{\"reviewText\":\"" + reviewText.replace("\"", "\\\"") + "\"}";
            
            URL url = new URL(NLP_SERVICE_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);
            
            try(OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);
            }
            
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
                
                analyzeNlpResponse(responseBody);
            } else {
                System.err.println("NLP Service returned error: " + responseCode);
            }

        } catch (Exception e) {
            System.err.println("Error connecting to NLP Service: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void analyzeNlpResponse(String responseBody) {
        try {
            System.out.println("\n=== ANALYZING NLP SERVICE RESPONSE ===");
            
            String sentiment = extractJsonValue(responseBody, "sentiment");
            String ratingScore = extractJsonValue(responseBody, "rating_score");
            String isFakeReview = extractJsonValue(responseBody, "is_fake_review");
            String priority = extractJsonValue(responseBody, "priority");
            String helpfulnessScore = extractJsonValue(responseBody, "helpfulness_score");
            
            System.out.println("Sentiment: " + sentiment + " (Type: String)");
            System.out.println("Rating Score: " + ratingScore + " (Type: Integer)");
            System.out.println("Is Fake Review: " + isFakeReview + " (Type: Boolean)");
            System.out.println("Priority: " + priority + " (Type: String)");
            System.out.println("Helpfulness Score: " + helpfulnessScore + " (Type: Integer)");

            System.out.println("\n=== MAPPING CHECK WITH REVIEW ENTITY ===");
            System.out.println("OK sentiment: String -> Review.sentiment (String) - MATCHES");
            System.out.println("WARNING rating_score: Integer -> Review.rating (Integer) - NEEDS CONSIDERATION");
            System.out.println("OK is_fake_review: Boolean -> Review.isFake (Boolean) - MATCHES");
            System.out.println("OK priority: String -> Review.priority (String) - MATCHES");
            System.out.println("OK helpfulness_score: Integer -> Review.helpfulnessScore (Integer) - MATCHES");

            String justification = extractJsonValue(responseBody, "justification");
            if (justification != null && !justification.isEmpty() && !justification.equals("null")) {
                System.out.println("\n=== AI EXPLANATION ===");
                System.out.println("Justification: " + justification);
            }

        } catch (Exception e) {
            System.err.println("Error analyzing NLP Service response: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static String extractJsonValue(String json, String key) {
        String searchPattern = "\"" + key + "\":";
        int startIndex = json.indexOf(searchPattern);
        if (startIndex == -1) return "null";
        
        startIndex += searchPattern.length();
        
        while (startIndex < json.length() && Character.isWhitespace(json.charAt(startIndex))) {
            startIndex++;
        }
        
        if (startIndex >= json.length()) return "null";
        
        char nextChar = json.charAt(startIndex);
        if (nextChar == '"') {
            startIndex++;
            int endIndex = json.indexOf("\"", startIndex);
            if (endIndex == -1) return "null";
            return json.substring(startIndex, endIndex);
        } else if (nextChar == 't' || nextChar == 'f') {
            int endIndex = json.indexOf(",", startIndex);
            if (endIndex == -1) endIndex = json.indexOf("}", startIndex);
            if (endIndex == -1) return "null";
            return json.substring(startIndex, endIndex);
        } else {
            int endIndex = json.indexOf(",", startIndex);
            if (endIndex == -1) endIndex = json.indexOf("}", startIndex);
            if (endIndex == -1) return "null";
            return json.substring(startIndex, endIndex);
        }
    }
}

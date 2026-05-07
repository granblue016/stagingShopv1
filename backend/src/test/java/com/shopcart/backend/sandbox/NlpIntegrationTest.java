package com.shopcart.backend.sandbox;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Test class for NLP Service integration
 */
@SpringBootTest
@ActiveProfiles("test")
public class NlpIntegrationTest {

    @Test
    public void testNlpServiceConnection() {
        NlpIntegrationSandbox sandbox = new NlpIntegrationSandbox();
        
        System.out.println("=== BẮT ĐẦU THỬ NGHIỆM KẾT NỐI NLP SERVICE ===");
        
        // Test health check first
        sandbox.testHealthCheck();
        
        // Test with sample reviews
        sandbox.testNlpServiceConnection();
        
        System.out.println("=== KẾT THÚC THỬ NGHIỆM NLP SERVICE ===");
    }
}

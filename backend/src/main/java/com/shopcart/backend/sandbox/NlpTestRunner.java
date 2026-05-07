package com.shopcart.backend.sandbox;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

/**
 * Test runner for NLP Service integration
 * This component can be used to run NLP integration tests during application startup
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "nlp.test.enabled", havingValue = "true")
public class NlpTestRunner implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        log.info("=== CHẠY THỬ NGHIỆM NLP INTEGRATION ===");
        
        NlpIntegrationSandbox sandbox = new NlpIntegrationSandbox();
        
        // Test health check first
        sandbox.testHealthCheck();
        
        // Test NLP service connection with sample reviews
        sandbox.testNlpServiceConnection();
        
        log.info("=== HOÀN THÀNH THỬ NGHIỆM NLP INTEGRATION ===");
    }
}

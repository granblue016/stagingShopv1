package com.shopcart.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.shopcart.backend.service.NlpService;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired
    private NlpService nlpService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check NLP service health
            Mono<Boolean> nlpHealth = nlpService.isHealthy();
            Boolean isNlpHealthy = nlpHealth.timeout(java.time.Duration.ofSeconds(5)).block();
            
            response.put("status", "ok");
            response.put("backend", "healthy");
            response.put("nlp_service", isNlpHealthy != null && isNlpHealthy ? "healthy" : "unhealthy");
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "degraded");
            response.put("backend", "healthy");
            response.put("nlp_service", "unhealthy");
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
    
    @GetMapping("/ready")
    public ResponseEntity<Map<String, Object>> ready() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if NLP service is ready
            Mono<Boolean> nlpHealth = nlpService.isHealthy();
            Boolean isNlpHealthy = nlpHealth.timeout(java.time.Duration.ofSeconds(5)).block();
            
            if (isNlpHealthy != null && isNlpHealthy) {
                response.put("status", "ready");
                response.put("message", "All services are ready");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "not ready");
                response.put("message", "NLP service is not ready");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }
            
        } catch (Exception e) {
            response.put("status", "not ready");
            response.put("message", "Services are not ready: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
}

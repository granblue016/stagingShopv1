package com.shopcart.backend.sandbox;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashVerificationTest {
    
    @Test
    public void verifyAdminPasswordHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "Admin123";
        
        // Hash hiện tại trong data.sql
        String existingHash = "$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2";
        
        System.out.println("=== HASH VERIFICATION TEST ===");
        System.out.println("Password: " + password);
        System.out.println("Existing Hash in data.sql: " + existingHash);
        System.out.println("Matches? " + encoder.matches(password, existingHash));
        
        // Generate new hash for comparison
        String newHash = encoder.encode(password);
        System.out.println("Newly Generated Hash: " + newHash);
        System.out.println("New hash matches password? " + encoder.matches(password, newHash));
        
        // Test với các password khác
        System.out.println("\n=== TEST OTHER PASSWORDS ===");
        String demoPassword = "demo123";
        String demoHash = "$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG";
        System.out.println("demo123 matches existing hash? " + encoder.matches(demoPassword, demoHash));
        
        String userPassword = "User123";
        String userHash = "$2a$10$ByIUiNaRfBKSV6B8XmxZBuOXtynqdkiEB16HCjedQP3Sy.Y3.333G";
        System.out.println("User123 matches existing hash? " + encoder.matches(userPassword, userHash));
    }
}

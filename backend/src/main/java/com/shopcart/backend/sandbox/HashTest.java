package com.shopcart.backend.sandbox;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "Admin123";
        String hash = encoder.encode(password);
        
        System.out.println("Password: " + password);
        System.out.println("Generated Hash: " + hash);
        
        // Hash hiện tại trong data.sql
        String existingHash = "$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2";
        System.out.println("Existing Hash in data.sql: " + existingHash);
        System.out.println("Matches? " + encoder.matches(password, existingHash));
        
        // Test với các password khác
        System.out.println("\n--- Test other passwords ---");
        String demoPassword = "demo123";
        String demoHash = "$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG";
        System.out.println("demo123 matches? " + encoder.matches(demoPassword, demoHash));
        
        String userPassword = "User123";
        String userHash = "$2a$10$ByIUiNaRfBKSV6B8XmxZBuOXtynqdkiEB16HCjedQP3Sy.Y3.333G";
        System.out.println("User123 matches? " + encoder.matches(userPassword, userHash));
    }
}

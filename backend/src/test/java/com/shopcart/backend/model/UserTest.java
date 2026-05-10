package com.shopcart.backend.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("hashedPassword")
                .name("Test User")
                .avatar("avatar.jpg")
                .role("USER")
                .token("auth-token")
                .build();
    }

    @Test
    void testUserBuilder() {
        assertNotNull(user);
        assertEquals(1L, user.getId());
        assertEquals("test@example.com", user.getEmail());
        assertEquals("hashedPassword", user.getPassword());
        assertEquals("Test User", user.getName());
        assertEquals("avatar.jpg", user.getAvatar());
        assertEquals("USER", user.getRole());
        assertEquals("auth-token", user.getToken());
    }

    @Test
    void testUserNoArgsConstructor() {
        User newUser = new User();
        assertNotNull(newUser);
        assertNull(newUser.getId());
        assertNull(newUser.getEmail());
        assertEquals("USER", newUser.getRole()); // Default value
    }

    @Test
    void testUserAllArgsConstructor() {
        User fullUser = new User(
                2L, "full@example.com", "password", 
                "Full User", "full.jpg", "ADMIN", 
                LocalDateTime.now(), "full-token"
        );
        assertNotNull(fullUser);
        assertEquals(2L, fullUser.getId());
        assertEquals("full@example.com", fullUser.getEmail());
        assertEquals("ADMIN", fullUser.getRole());
    }

    @Test
    void testSettersAndGetters() {
        user.setEmail("new@example.com");
        user.setName("New Name");
        user.setRole("ADMIN");

        assertEquals("new@example.com", user.getEmail());
        assertEquals("New Name", user.getName());
        assertEquals("ADMIN", user.getRole());
    }

    @Test
    void testPrePersist() {
        User testUser = new User();
        testUser.setEmail("persist@example.com");
        testUser.setPassword("password");
        
        // Simulate @PrePersist
        testUser.onCreate();
        
        assertNotNull(testUser.getCreatedAt());
        assertTrue(testUser.getCreatedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
    }

    @Test
    void testToString() {
        String userString = user.toString();
        assertTrue(userString.contains("test@example.com"));
        assertTrue(userString.contains("Test User"));
        assertFalse(userString.contains("hashedPassword")); // Password should be excluded
    }

    @Test
    void testEqualsAndHashCode() {
        User user1 = User.builder()
                .id(1L)
                .email("test@example.com")
                .build();

        User user2 = User.builder()
                .id(1L)
                .email("test@example.com")
                .build();

        User user3 = User.builder()
                .id(2L)
                .email("test@example.com")
                .build();

        assertEquals(user1, user2);
        assertEquals(user1.hashCode(), user2.hashCode());
        assertNotEquals(user1, user3);
        assertNotEquals(user1.hashCode(), user3.hashCode());
    }
}

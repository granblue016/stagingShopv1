package com.shopcart.backend.dto;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class LoginRequestTest {

    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest("test@example.com", "password123");
    }

    @Test
    void testLoginRequestAllArgsConstructor() {
        assertNotNull(loginRequest);
        assertEquals("test@example.com", loginRequest.getEmail());
        assertEquals("password123", loginRequest.getPassword());
    }

    @Test
    void testLoginRequestNoArgsConstructor() {
        LoginRequest newLoginRequest = new LoginRequest();
        assertNotNull(newLoginRequest);
        assertNull(newLoginRequest.getEmail());
        assertNull(newLoginRequest.getPassword());
    }

    @Test
    void testSettersAndGetters() {
        loginRequest.setEmail("updated@example.com");
        loginRequest.setPassword("updatedPassword");

        assertEquals("updated@example.com", loginRequest.getEmail());
        assertEquals("updatedPassword", loginRequest.getPassword());
    }

    @Test
    void testToString() {
        String loginRequestString = loginRequest.toString();
        assertTrue(loginRequestString.contains("test@example.com"));
        assertTrue(loginRequestString.contains("password123"));
    }

    @Test
    void testEqualsAndHashCode() {
        LoginRequest loginRequest1 = new LoginRequest("test@example.com", "password123");
        LoginRequest loginRequest2 = new LoginRequest("test@example.com", "password123");
        LoginRequest loginRequest3 = new LoginRequest("different@example.com", "password123");

        assertEquals(loginRequest1, loginRequest2);
        assertEquals(loginRequest1.hashCode(), loginRequest2.hashCode());
        assertNotEquals(loginRequest1, loginRequest3);
        assertNotEquals(loginRequest1.hashCode(), loginRequest3.hashCode());
    }

    @Test
    void testLoginRequestWithNullValues() {
        LoginRequest nullLoginRequest = new LoginRequest();
        nullLoginRequest.setEmail(null);
        nullLoginRequest.setPassword(null);

        assertNull(nullLoginRequest.getEmail());
        assertNull(nullLoginRequest.getPassword());
    }

    @Test
    void testLoginRequestWithEmptyValues() {
        LoginRequest emptyLoginRequest = new LoginRequest("", "");
        
        assertEquals("", emptyLoginRequest.getEmail());
        assertEquals("", emptyLoginRequest.getPassword());
    }

    @Test
    void testLoginRequestWithDifferentPasswords() {
        LoginRequest sameEmailDifferentPassword = new LoginRequest("test@example.com", "differentPassword");
        
        assertEquals("test@example.com", sameEmailDifferentPassword.getEmail());
        assertEquals("differentPassword", sameEmailDifferentPassword.getPassword());
        assertNotEquals(loginRequest, sameEmailDifferentPassword);
    }
}

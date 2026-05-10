package com.shopcart.backend.dto;

import com.shopcart.backend.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class LoginResponseTest {

    private LoginResponse loginResponse;
    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .role("USER")
                .build();

        loginResponse = LoginResponse.builder()
                .token("test-token")
                .user(user)
                .build();
    }

    @Test
    void testLoginResponseBuilder() {
        assertNotNull(loginResponse);
        assertEquals("test-token", loginResponse.getToken());
        assertEquals(user, loginResponse.getUser());
    }

    @Test
    void testLoginResponseNoArgsConstructor() {
        LoginResponse newLoginResponse = new LoginResponse();
        assertNotNull(newLoginResponse);
        assertNull(newLoginResponse.getToken());
        assertNull(newLoginResponse.getUser());
    }

    @Test
    void testLoginResponseAllArgsConstructor() {
        LoginResponse fullLoginResponse = new LoginResponse("full-token", user);
        assertNotNull(fullLoginResponse);
        assertEquals("full-token", fullLoginResponse.getToken());
        assertEquals(user, fullLoginResponse.getUser());
    }

    @Test
    void testSettersAndGetters() {
        User updatedUser = User.builder()
                .id(2L)
                .email("updated@example.com")
                .name("Updated User")
                .role("ADMIN")
                .build();

        loginResponse.setToken("updated-token");
        loginResponse.setUser(updatedUser);

        assertEquals("updated-token", loginResponse.getToken());
        assertEquals(updatedUser, loginResponse.getUser());
    }

    @Test
    void testToString() {
        String loginResponseString = loginResponse.toString();
        assertTrue(loginResponseString.contains("test-token"));
        assertTrue(loginResponseString.contains("Test User"));
    }

    @Test
    void testEqualsAndHashCode() {
        LoginResponse loginResponse1 = LoginResponse.builder()
                .token("test-token")
                .user(user)
                .build();

        LoginResponse loginResponse2 = LoginResponse.builder()
                .token("test-token")
                .user(user)
                .build();

        User differentUser = User.builder()
                .id(3L)
                .email("different@example.com")
                .name("Different User")
                .role("USER")
                .build();

        LoginResponse loginResponse3 = LoginResponse.builder()
                .token("test-token")
                .user(differentUser)
                .build();

        assertEquals(loginResponse1, loginResponse2);
        assertEquals(loginResponse1.hashCode(), loginResponse2.hashCode());
        assertNotEquals(loginResponse1, loginResponse3);
        assertNotEquals(loginResponse1.hashCode(), loginResponse3.hashCode());
    }

    @Test
    void testLoginResponseWithNullValues() {
        LoginResponse nullLoginResponse = new LoginResponse();
        nullLoginResponse.setToken(null);
        nullLoginResponse.setUser(null);

        assertNull(nullLoginResponse.getToken());
        assertNull(nullLoginResponse.getUser());
    }

    @Test
    void testLoginResponseWithEmptyToken() {
        LoginResponse emptyTokenResponse = new LoginResponse("", user);
        
        assertEquals("", emptyTokenResponse.getToken());
        assertEquals(user, emptyTokenResponse.getUser());
    }

    @Test
    void testLoginResponseWithNullUser() {
        LoginResponse nullUserResponse = new LoginResponse("test-token", null);
        
        assertEquals("test-token", nullUserResponse.getToken());
        assertNull(nullUserResponse.getUser());
    }

    @Test
    void testLoginResponseWithDifferentTokens() {
        LoginResponse differentTokenResponse = LoginResponse.builder()
                .token("different-token")
                .user(user)
                .build();

        assertEquals("different-token", differentTokenResponse.getToken());
        assertEquals(user, differentTokenResponse.getUser());
        assertNotEquals(loginResponse, differentTokenResponse);
    }
}

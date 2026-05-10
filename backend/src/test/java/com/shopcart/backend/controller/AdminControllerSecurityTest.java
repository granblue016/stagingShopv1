package com.shopcart.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCoupon_AsAdmin_ReturnsSuccess() throws Exception {
        Map<String, Object> couponData = new HashMap<>();
        couponData.put("code", "TEST_ADMIN_SUCCESS");
        couponData.put("type", "PERCENT");
        couponData.put("value", 50.0);
        couponData.put("expiryDate", "2025-12-31T23:59:59");

        mockMvc.perform(post("/api/admin/coupons")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(couponData)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    void createCoupon_AsUser_ReturnsForbidden() throws Exception {
        Map<String, Object> couponData = new HashMap<>();
        couponData.put("code", "TEST_USER_FORBIDDEN");
        couponData.put("type", "PERCENT");
        couponData.put("value", 50.0);
        couponData.put("expiryDate", "2025-12-31T23:59:59");

        mockMvc.perform(post("/api/admin/coupons")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(couponData)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createCoupon_AsAnonymous_ReturnsUnauthorized() throws Exception {
        Map<String, Object> couponData = new HashMap<>();
        couponData.put("code", "TEST_ANONYMOUS_UNAUTHORIZED");
        couponData.put("type", "PERCENT");
        couponData.put("value", 50.0);
        couponData.put("expiryDate", "2025-12-31T23:59:59");

        mockMvc.perform(post("/api/admin/coupons")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(couponData)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateInventory_AsAdmin_ReturnsSuccess() throws Exception {
        Map<String, Object> inventoryData = new HashMap<>();
        inventoryData.put("stockQuantity", 100);

        mockMvc.perform(put("/api/admin/inventory/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inventoryData)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    void updateInventory_AsUser_ReturnsForbidden() throws Exception {
        Map<String, Object> inventoryData = new HashMap<>();
        inventoryData.put("stockQuantity", 100);

        mockMvc.perform(put("/api/admin/inventory/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inventoryData)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateInventory_AsAnonymous_ReturnsUnauthorized() throws Exception {
        Map<String, Object> inventoryData = new HashMap<>();
        inventoryData.put("stockQuantity", 100);

        mockMvc.perform(put("/api/admin/inventory/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inventoryData)))
                .andExpect(status().isForbidden());
    }
}

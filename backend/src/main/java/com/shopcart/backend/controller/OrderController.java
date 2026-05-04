package com.shopcart.backend.controller;

import com.shopcart.backend.dto.OrderRequest;
import com.shopcart.backend.model.Order;
import com.shopcart.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * Xử lý đặt hàng và thanh toán
     * Endpoint: POST /api/orders/checkout
     */
    @PostMapping("/checkout")
    public ResponseEntity<Order> checkout(@RequestBody OrderRequest request) {
        // Tạm thời mock UserID = 1
        Long currentUserId = 1L;

        // OrderService sẽ xử lý logic trừ kho (Stock) và lưu đơn hàng
        Order newOrder = orderService.createOrder(request, currentUserId);
        return new ResponseEntity<>(newOrder, HttpStatus.CREATED);
    }

    /**
     * Lấy lịch sử đơn hàng của cá nhân người dùng
     * Endpoint: GET /api/orders/me
     */
    @GetMapping("/me")
    public ResponseEntity<List<Order>> getMyOrders() {
        // Tạm thời mock UserID = 1
        Long currentUserId = 1L;

        List<Order> orders = orderService.getUserOrders(currentUserId);
        return ResponseEntity.ok(orders);
    }
}
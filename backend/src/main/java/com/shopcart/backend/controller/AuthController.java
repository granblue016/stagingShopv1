package com.shopcart.backend.controller;

import com.shopcart.backend.dto.LoginRequest;
import com.shopcart.backend.dto.LoginResponse;
import com.shopcart.backend.model.User;
import com.shopcart.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
// Đã gỡ bỏ @CrossOrigin vì SecurityConfig đã quản lý tập trung
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * API Đăng nhập
     * Kết nối với trang login.tsx của Lovable
     * Endpoint: POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // Không cần try-catch: Nếu sai mật khẩu/email, AuthService ném RuntimeException
        // và GlobalExceptionHandler sẽ trả về 400 Bad Request cho Frontend
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * API Đăng ký tài khoản mới
     * Kết nối với trang register.tsx của Lovable
     * Endpoint: POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Password is required");
        }
        User newUser = authService.register(user);
        return new ResponseEntity<>(newUser, HttpStatus.CREATED);
    }
}
package com.shopcart.backend.service;

import com.shopcart.backend.dto.LoginRequest;
import com.shopcart.backend.dto.LoginResponse;
import com.shopcart.backend.model.User;
import com.shopcart.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor // Tự động tạo Constructor cho các final field để Inject
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * Logic Đăng nhập
     */
    public LoginResponse login(LoginRequest request) {
        // 1. Tìm user theo email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Email hoặc mật khẩu không chính xác!"));

        // 2. Kiểm tra mật khẩu đã mã hóa
        // Chuyển từ .equals() sang .matches() để so sánh hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Email hoặc mật khẩu không chính xác!");
        }

        // 3. Tạo Token (Hiện tại là token ngẫu nhiên để Frontend lưu vào LocalStorage)
        // Sau này khi tích hợp JWT hoàn chỉnh, bạn sẽ thay UUID bằng chuỗi JWT
        String token = UUID.randomUUID().toString();

        return LoginResponse.builder()
                .token(token)
                .user(user)
                .build();
    }

    /**
     * Logic Đăng ký tài khoản mới
     */
    @Transactional
    public User register(User newUser) {
        // 1. Kiểm tra email duy nhất
        if (userRepository.existsByEmail(newUser.getEmail())) {
            throw new RuntimeException("Email này đã được sử dụng!");
        }

        // 2. MÃ HÓA MẬT KHẨU trước khi lưu vào DB
        // Đây là bước bắt buộc để bảo mật thông tin người dùng
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

        // 3. Thiết lập các giá trị mặc định cho User mới
        if (newUser.getRole() == null) {
            newUser.setRole("USER");
        }

        // Tạo avatar ngẫu nhiên theo tên để giao diện Lovable trông sinh động hơn
        if (newUser.getAvatar() == null || newUser.getAvatar().isEmpty()) {
            newUser.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + newUser.getName());
        }

        // 4. Lưu vào Database
        return userRepository.save(newUser);
    }
}
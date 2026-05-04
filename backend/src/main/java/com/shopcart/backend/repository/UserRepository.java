package com.shopcart.backend.repository;

import com.shopcart.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Phương thức "sống còn" để phục vụ logic Đăng nhập (AuthService)
    // Giúp tìm đúng người dùng dựa trên email họ nhập từ Frontend
    Optional<User> findByEmail(String email);

    // Kiểm tra xem email đã tồn tại chưa khi khách hàng Đăng ký (Register)
    Boolean existsByEmail(String email);
}
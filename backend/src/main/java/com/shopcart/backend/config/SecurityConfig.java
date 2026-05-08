package com.shopcart.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private TokenAuthenticationFilter tokenAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. Cấu hình CORS để cho phép Frontend (8080) gọi sang Backend (8081)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Vô hiệu hóa CSRF để các request POST/PUT từ Frontend không bị chặn
                .csrf(csrf -> csrf.disable())

                // 3. Thêm TokenAuthenticationFilter trước UsernamePasswordAuthenticationFilter
                .addFilterBefore(tokenAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // 4. Phân quyền truy cập API
                .authorizeHttpRequests(auth -> auth
                        // Cho phép tất cả mọi người truy cập các API liên quan đến đăng nhập/đăng ký
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/health").permitAll()
                        .requestMatchers("/api/health/**").permitAll()

                        // MỞ KHÓA: Cho phép khách xem danh sách sản phẩm và bình luận mà không cần đăng nhập
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/reviews/**").permitAll()

                        // Admin endpoints được bảo vệ bởi @PreAuthorize ở controller level
                        .requestMatchers("/api/admin/**").authenticated()

                        // Tất cả các yêu cầu khác (đặt hàng, v.v.) đều yêu cầu phải có Token
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Cho phép nguồn từ Frontend chạy trên cổng 8080
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:8080"));

        // Các phương thức được phép thực hiện
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Cho phép tất cả các Header để đảm bảo JWT Token và Content-Type được gửi đi an toàn
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Cho phép gửi kèm thông tin xác thực (Cookies, Authorization Header)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
        // Use NoOpPasswordEncoder for dev environment to simplify login testing
        // Passwords are stored as plain text in data.sql
        return org.springframework.security.crypto.password.NoOpPasswordEncoder.getInstance();
    }
}
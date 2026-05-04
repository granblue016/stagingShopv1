-- Chỉ thêm user nếu email chưa tồn tại để tránh lỗi Duplicate
-- Password: demo123 (BCrypt hash generated with strength 10)
INSERT INTO users (email, password, name, role, created_at)
SELECT 'demo@shopcart.dev',
       '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
       'Demo User',
       'USER',
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'demo@shopcart.dev'
);
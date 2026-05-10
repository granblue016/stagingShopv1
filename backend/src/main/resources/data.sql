-- Clean user data for testing
DELETE FROM users WHERE email IN ('admin_test@shopcart.dev', 'user_test@shopcart.dev');

-- Admin test account (Password: Admin123 - Plain text)
INSERT INTO users (email, password, role, name) VALUES ('admin_test@shopcart.dev', 'Admin123', 'ADMIN', 'Admin Test');

-- User test account (Password: User123 - Plain text)
INSERT INTO users (email, password, role, name) VALUES ('user_test@shopcart.dev', 'User123', 'USER', 'User Test');

-- Seed sample products if products table is empty
INSERT INTO products (name, description, price, image_url, stock_quantity, category)
SELECT 
    'Wireless Headphones',
    'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
    149.99,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    50,
    'Electronics'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Wireless Headphones');

INSERT INTO products (name, description, price, image_url, stock_quantity, category)
SELECT 
    'Smart Watch',
    'Feature-rich smartwatch with health tracking, GPS, and water resistance.',
    299.99,
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    30,
    'Electronics'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Smart Watch');

INSERT INTO products (name, description, price, image_url, stock_quantity, category)
SELECT 
    'Running Shoes',
    'Lightweight and comfortable running shoes with advanced cushioning technology.',
    89.99,
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    100,
    'Sports'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Running Shoes');

INSERT INTO products (name, description, price, image_url, stock_quantity, category)
SELECT 
    'Laptop Backpack',
    'Durable and spacious backpack with padded laptop compartment and multiple pockets.',
    59.99,
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    75,
    'Accessories'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Laptop Backpack');

INSERT INTO products (name, description, price, image_url, stock_quantity, category)
SELECT 
    'Bluetooth Speaker',
    'Portable Bluetooth speaker with powerful bass and 12-hour battery life.',
    79.99,
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    40,
    'Electronics'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bluetooth Speaker');

INSERT INTO products (name, description, price, image_url, stock_quantity, category)
SELECT
    'Yoga Mat',
    'Non-slip yoga mat with extra thickness for comfort during workouts.',
    34.99,
    'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
    60,
    'Sports'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Yoga Mat');

-- Seed sample coupons
INSERT INTO coupons (code, type, value, expiry_date, active, created_at)
SELECT 'SAVE10',
       'PERCENT',
       10.0,
       CURRENT_TIMESTAMP + INTERVAL '30 days',
       true,
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'SAVE10');

INSERT INTO coupons (code, type, value, expiry_date, active, created_at)
SELECT 'FIXED20',
       'FIXED',
       20.0,
       CURRENT_TIMESTAMP + INTERVAL '30 days',
       true,
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'FIXED20');

-- Get user IDs for sample data
DO $$
DECLARE
    admin_user_id BIGINT;
    user_user_id BIGINT;
    product1_id BIGINT;
    product2_id BIGINT;
    product3_id BIGINT;
    product1_name TEXT;
    product2_name TEXT;
    product3_name TEXT;
    product1_price NUMERIC;
    product2_price NUMERIC;
    product3_price NUMERIC;
    product1_image TEXT;
    product2_image TEXT;
    product3_image TEXT;
    product1_stock INT;
    product2_stock INT;
    product3_stock INT;
BEGIN
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin_test@shopcart.dev' LIMIT 1;
    SELECT id INTO user_user_id FROM users WHERE email = 'user_test@shopcart.dev' LIMIT 1;
    
    SELECT id, name, price, image_url, stock_quantity 
    INTO product1_id, product1_name, product1_price, product1_image, product1_stock
    FROM products WHERE name = 'Wireless Headphones' LIMIT 1;
    
    SELECT id, name, price, image_url, stock_quantity 
    INTO product2_id, product2_name, product2_price, product2_image, product2_stock
    FROM products WHERE name = 'Smart Watch' LIMIT 1;
    
    SELECT id, name, price, image_url, stock_quantity 
    INTO product3_id, product3_name, product3_price, product3_image, product3_stock
    FROM products WHERE name = 'Running Shoes' LIMIT 1;

    -- Sample Order 1 (User Test - Delivered)
    INSERT INTO orders (user_id, status, subtotal, discount, shipping_fee, total, created_at)
    VALUES (user_user_id, 'DELIVERED', 239.98, 0.0, 5.0, 244.98, CURRENT_TIMESTAMP - INTERVAL '2 days');

    INSERT INTO order_items (order_id, product_id, name, price, quantity, stock_quantity, image_url)
    VALUES (
        (SELECT order_id FROM orders WHERE user_id = user_user_id AND status = 'DELIVERED' ORDER BY created_at DESC LIMIT 1),
        product1_id, product1_name, product1_price, 1, product1_stock, product1_image
    );
    
    INSERT INTO order_items (order_id, product_id, name, price, quantity, stock_quantity, image_url)
    VALUES (
        (SELECT order_id FROM orders WHERE user_id = user_user_id AND status = 'DELIVERED' ORDER BY created_at DESC LIMIT 1),
        product2_id, product2_name, product2_price, 1, product2_stock, product2_image
    );

    -- Sample Order 2 (User Test - Pending)
    INSERT INTO orders (user_id, status, subtotal, discount, shipping_fee, total, created_at)
    VALUES (user_user_id, 'PENDING', 89.99, 0.0, 5.0, 94.99, CURRENT_TIMESTAMP - INTERVAL '1 day');

    INSERT INTO order_items (order_id, product_id, name, price, quantity, stock_quantity, image_url)
    VALUES (
        (SELECT order_id FROM orders WHERE user_id = user_user_id AND status = 'PENDING' ORDER BY created_at DESC LIMIT 1),
        product3_id, product3_name, product3_price, 1, product3_stock, product3_image
    );

    -- Sample Review 1 (Positive)
    INSERT INTO reviews (user_id, product_id, content, rating, sentiment, is_fake, priority, helpfulness_score, ai_sentiment, ai_rating, ai_priority, ai_primary_emotion, created_at)
    VALUES (
        user_user_id,
        product1_id,
        'Tai nghe rất tốt, âm thanh rõ nét và pin trâu. Đáng tiền!',
        5,
        'Positive',
        false,
        'LOW',
        8,
        'Positive',
        5,
        'LOW',
        'Joy',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    );

    INSERT INTO review_suggested_features (review_id, feature)
    VALUES (
        (SELECT id FROM reviews WHERE content LIKE '%Headphones%' ORDER BY created_at DESC LIMIT 1),
        'Noise cancellation'
    );
    
    INSERT INTO review_suggested_features (review_id, feature)
    VALUES (
        (SELECT id FROM reviews WHERE content LIKE '%Headphones%' ORDER BY created_at DESC LIMIT 1),
        'Battery life'
    );

    -- Sample Review 2 (Negative - Critical)
    INSERT INTO reviews (user_id, product_id, content, rating, sentiment, is_fake, priority, helpfulness_score, ai_sentiment, ai_rating, ai_priority, ai_primary_emotion, created_at)
    VALUES (
        user_user_id,
        product2_id,
        'Màn hình rất tối, pin yếu, không đáng tiền. Hơi thất vọng.',
        2,
        'Negative',
        false,
        'HIGH',
        5,
        'Negative',
        2,
        'HIGH',
        'Disappointment',
        CURRENT_TIMESTAMP - INTERVAL '3 hours'
    );

    INSERT INTO review_suggested_features (review_id, feature)
    VALUES (
        (SELECT id FROM reviews WHERE content LIKE '%Smart Watch%' ORDER BY created_at DESC LIMIT 1),
        'Screen brightness'
    );
    
    INSERT INTO review_suggested_features (review_id, feature)
    VALUES (
        (SELECT id FROM reviews WHERE content LIKE '%Smart Watch%' ORDER BY created_at DESC LIMIT 1),
        'Battery improvement'
    );

    -- Sample Review 3 (Fake Detection)
    INSERT INTO reviews (user_id, product_id, content, rating, sentiment, is_fake, priority, helpfulness_score, ai_sentiment, ai_rating, ai_priority, ai_primary_emotion, created_at)
    VALUES (
        user_user_id,
        product3_id,
        'Sản phẩm TUYỆT VỜI NHẤT MẤY CHỜ RỒI! MUA NGAY KHÔNG HỐI TIẾC! 100% ĐƯỢC!',
        5,
        'Positive',
        true,
        'CRITICAL',
        1,
        'Positive',
        5,
        'CRITICAL',
        'Excitement',
        CURRENT_TIMESTAMP - INTERVAL '5 hours'
    );

    INSERT INTO review_suggested_features (review_id, feature)
    VALUES (
        (SELECT id FROM reviews WHERE content LIKE '%TUYỆT VỜI%' ORDER BY created_at DESC LIMIT 1),
        'Comfort'
    );
END $$;
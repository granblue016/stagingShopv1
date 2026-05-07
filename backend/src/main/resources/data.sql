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
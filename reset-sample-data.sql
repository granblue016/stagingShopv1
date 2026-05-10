-- Reset sample data for user_test@shopcart.dev
-- Run this script to clear existing sample data so data.sql can repopulate

-- Delete order items first (foreign key constraint)
DELETE FROM order_items 
WHERE order_id IN (
    SELECT order_id FROM orders 
    WHERE user_id = (SELECT id FROM users WHERE email = 'user_test@shopcart.dev')
);

-- Delete orders for user_test
DELETE FROM orders 
WHERE user_id = (SELECT id FROM users WHERE email = 'user_test@shopcart.dev');

-- Delete review suggested features first (foreign key constraint)
DELETE FROM review_suggested_features 
WHERE review_id IN (
    SELECT id FROM reviews 
    WHERE user_id = (SELECT id FROM users WHERE email = 'user_test@shopcart.dev')
);

-- Delete reviews for user_test
DELETE FROM reviews 
WHERE user_id = (SELECT id FROM users WHERE email = 'user_test@shopcart.dev');

-- Confirm deletion
SELECT 'Sample data cleared. Restart backend to reload from data.sql.' as status;

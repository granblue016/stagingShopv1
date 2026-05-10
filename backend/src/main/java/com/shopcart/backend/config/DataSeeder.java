package com.shopcart.backend.config;

import com.shopcart.backend.model.*;
import com.shopcart.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("=== DATA SEEDER START ===");
        
        // Check each entity type individually to allow partial seeding
        if (userRepository.count() == 0) {
            seedUsers();
            System.out.println("Users seeded");
        } else {
            System.out.println("Users already exist, skipping user seeding");
        }
        
        if (productRepository.count() == 0) {
            seedProducts();
            System.out.println("Products seeded");
        } else {
            System.out.println("Products already exist, skipping product seeding");
        }
        
        if (orderRepository.count() == 0) {
            seedOrders();
            System.out.println("Orders seeded");
        } else {
            System.out.println("Orders already exist, skipping order seeding");
        }
        
        if (reviewRepository.count() == 0) {
            seedReviews();
            System.out.println("Reviews seeded");
        } else {
            System.out.println("Reviews already exist, skipping review seeding");
        }
        
        if (couponRepository.count() == 0) {
            seedCoupons();
            System.out.println("Coupons seeded");
        } else {
            System.out.println("Coupons already exist, skipping coupon seeding");
        }
        
        System.out.println("=== DATA SEEDING COMPLETED ===");
    }

    private void seedUsers() {
        System.out.println("Seeding users...");
        
        // Admin user
        User admin = User.builder()
            .email("admin_test@shopcart.dev")
            .password("Admin123")
            .role("ADMIN")
            .name("Admin Test")
            .build();
        userRepository.save(admin);

        // Regular user
        User user = User.builder()
            .email("user_test@shopcart.dev")
            .password("User123")
            .role("USER")
            .name("User Test")
            .build();
        userRepository.save(user);
    }

    private void seedProducts() {
        System.out.println("Seeding products...");
        
        Product headphones = Product.builder()
            .name("Wireless Headphones")
            .description("High-quality wireless headphones with noise cancellation and 30-hour battery life.")
            .price(149.99)
            .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500")
            .stockQuantity(50)
            .category("Electronics")
            .build();
        productRepository.save(headphones);

        Product smartWatch = Product.builder()
            .name("Smart Watch")
            .description("Feature-rich smartwatch with health tracking, GPS, and water resistance.")
            .price(299.99)
            .imageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500")
            .stockQuantity(30)
            .category("Electronics")
            .build();
        productRepository.save(smartWatch);

        Product runningShoes = Product.builder()
            .name("Running Shoes")
            .description("Lightweight and comfortable running shoes with advanced cushioning technology.")
            .price(89.99)
            .imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500")
            .stockQuantity(100)
            .category("Sports")
            .build();
        productRepository.save(runningShoes);
    }

    private void seedOrders() {
        System.out.println("Seeding orders...");
        
        User user = userRepository.findByEmail("user_test@shopcart.dev").orElse(null);
        List<Product> products = productRepository.findAll();
        
        Product headphones = products.stream()
            .filter(p -> p.getName().equals("Wireless Headphones"))
            .findFirst().orElse(null);
        Product smartWatch = products.stream()
            .filter(p -> p.getName().equals("Smart Watch"))
            .findFirst().orElse(null);
        Product runningShoes = products.stream()
            .filter(p -> p.getName().equals("Running Shoes"))
            .findFirst().orElse(null);

        if (user != null && headphones != null && smartWatch != null) {
            // Order 1 - Delivered
            Order order1 = Order.builder()
                .status("DELIVERED")
                .subtotal(239.98)
                .discount(0.0)
                .shippingFee(5.0)
                .total(244.98)
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();
            orderRepository.save(order1);

            // Order 2 - Pending
            Order order2 = Order.builder()
                .status("PENDING")
                .subtotal(89.99)
                .discount(0.0)
                .shippingFee(5.0)
                .total(94.99)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();
            orderRepository.save(order2);
        }
    }

    private void seedReviews() {
        System.out.println("Seeding reviews...");
        
        User user = userRepository.findByEmail("user_test@shopcart.dev").orElse(null);
        List<Product> products = productRepository.findAll();
        
        Product headphones = products.stream()
            .filter(p -> p.getName().equals("Wireless Headphones"))
            .findFirst().orElse(null);
        Product smartWatch = products.stream()
            .filter(p -> p.getName().equals("Smart Watch"))
            .findFirst().orElse(null);
        Product runningShoes = products.stream()
            .filter(p -> p.getName().equals("Running Shoes"))
            .findFirst().orElse(null);

        if (user != null && headphones != null && smartWatch != null && runningShoes != null) {
            // Review 1 - Positive
            Review review1 = new Review();
            review1.setUserId(user.getId());
            review1.setProductId(headphones.getId());
            review1.setContent("Tai nghe rất tốt, âm thanh rõ nét và pin trâu. Đáng tiền!");
            review1.setRating(5);
            review1.setSentiment("Positive");
            review1.setIsFake(false);
            review1.setPriority("LOW");
            review1.setHelpfulnessScore(8);
            review1.setAiSentiment("Positive");
            review1.setAiRating(5);
            review1.setAiPriority("LOW");
            review1.setAiPrimaryEmotion("Joy");
            review1.setCreatedAt(LocalDateTime.now().minusDays(1));
            reviewRepository.save(review1);

            // Review 2 - Negative
            Review review2 = new Review();
            review2.setUserId(user.getId());
            review2.setProductId(smartWatch.getId());
            review2.setContent("Màn hình rất tối, pin yếu, không đáng tiền. Hơi thất vọng.");
            review2.setRating(2);
            review2.setSentiment("Negative");
            review2.setIsFake(false);
            review2.setPriority("HIGH");
            review2.setHelpfulnessScore(5);
            review2.setAiSentiment("Negative");
            review2.setAiRating(2);
            review2.setAiPriority("HIGH");
            review2.setAiPrimaryEmotion("Disappointment");
            review2.setCreatedAt(LocalDateTime.now().minusHours(3));
            reviewRepository.save(review2);

            // Review 3 - Fake
            Review review3 = new Review();
            review3.setUserId(user.getId());
            review3.setProductId(runningShoes.getId());
            review3.setContent("Sản phẩm TUYỆT VỜI NHẤT MẤY CHỜ RỒI! MUA NGAY KHÔNG HỐI TIẾC! 100% ĐƯỢC!");
            review3.setRating(5);
            review3.setSentiment("Positive");
            review3.setIsFake(true);
            review3.setPriority("CRITICAL");
            review3.setHelpfulnessScore(1);
            review3.setAiSentiment("Positive");
            review3.setAiRating(5);
            review3.setAiPriority("CRITICAL");
            review3.setAiPrimaryEmotion("Excitement");
            review3.setCreatedAt(LocalDateTime.now().minusHours(5));
            reviewRepository.save(review3);
        }
    }

    private void seedCoupons() {
        System.out.println("Seeding coupons...");

        Coupon coupon1 = Coupon.builder()
            .code("SAVE10")
            .type("PERCENT")
            .value(10.0)
            .expiryDate(LocalDateTime.now().plusDays(30))
            .active(true)
            .minSpend(500000.0)
            .maxDiscount(100000.0)
            .usageLimit(100)
            .usedCount(0)
            .build();
        couponRepository.save(coupon1);

        Coupon coupon2 = Coupon.builder()
            .code("FIXED20")
            .type("FIXED")
            .value(20000.0)
            .expiryDate(LocalDateTime.now().plusDays(30))
            .active(true)
            .minSpend(200000.0)
            .usageLimit(50)
            .usedCount(0)
            .build();
        couponRepository.save(coupon2);

        Coupon coupon3 = Coupon.builder()
            .code("VIP20")
            .type("PERCENT")
            .value(20.0)
            .expiryDate(LocalDateTime.now().plusDays(60))
            .active(true)
            .minSpend(1000000.0)
            .maxDiscount(500000.0)
            .usageLimit(20)
            .usedCount(0)
            .build();
        couponRepository.save(coupon3);
    }
}

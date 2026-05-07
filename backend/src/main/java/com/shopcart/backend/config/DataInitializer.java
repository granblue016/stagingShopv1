package com.shopcart.backend.config;

import com.shopcart.backend.model.Product;
import com.shopcart.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        // Password hashes are now managed by data.sql - no force-update needed
        // This prevents BCrypt hash mismatch causing 401 errors

        // Initialize sample products if database is empty
        if (productRepository.count() == 0) {
            Product product1 = Product.builder()
                    .name("Wireless Headphones")
                    .description("High-quality wireless headphones with noise cancellation and 30-hour battery life.")
                    .price(149.99)
                    .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500")
                    .stockQuantity(50)
                    .category("Electronics")
                    .build();

            Product product2 = Product.builder()
                    .name("Smart Watch")
                    .description("Feature-rich smartwatch with health tracking, GPS, and water resistance.")
                    .price(299.99)
                    .imageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500")
                    .stockQuantity(30)
                    .category("Electronics")
                    .build();

            Product product3 = Product.builder()
                    .name("Running Shoes")
                    .description("Lightweight and comfortable running shoes with advanced cushioning technology.")
                    .price(89.99)
                    .imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500")
                    .stockQuantity(100)
                    .category("Sports")
                    .build();

            Product product4 = Product.builder()
                    .name("Laptop Backpack")
                    .description("Durable and spacious backpack with padded laptop compartment and multiple pockets.")
                    .price(59.99)
                    .imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500")
                    .stockQuantity(75)
                    .category("Accessories")
                    .build();

            Product product5 = Product.builder()
                    .name("Bluetooth Speaker")
                    .description("Portable Bluetooth speaker with powerful bass and 12-hour battery life.")
                    .price(79.99)
                    .imageUrl("https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500")
                    .stockQuantity(40)
                    .category("Electronics")
                    .build();

            Product product6 = Product.builder()
                    .name("Yoga Mat")
                    .description("Non-slip yoga mat with extra thickness for comfort during workouts.")
                    .price(34.99)
                    .imageUrl("https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500")
                    .stockQuantity(60)
                    .category("Sports")
                    .build();

            productRepository.save(product1);
            productRepository.save(product2);
            productRepository.save(product3);
            productRepository.save(product4);
            productRepository.save(product5);
            productRepository.save(product6);

            System.out.println("DEBUG: 6 sample products have been initialized in the database");
        }
    }
}

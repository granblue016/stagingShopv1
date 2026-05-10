package com.shopcart.backend.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class ProductTest {

    private Product product;

    @BeforeEach
    void setUp() {
        product = Product.builder()
                .id(1L)
                .name("Test Product")
                .description("Test Description")
                .price(99.99)
                .imageUrl("test.jpg")
                .stockQuantity(100)
                .category("Electronics")
                .build();
    }

    @Test
    void testProductBuilder() {
        assertNotNull(product);
        assertEquals(1L, product.getId());
        assertEquals("Test Product", product.getName());
        assertEquals("Test Description", product.getDescription());
        assertEquals(99.99, product.getPrice());
        assertEquals("test.jpg", product.getImageUrl());
        assertEquals(100, product.getStockQuantity());
        assertEquals("Electronics", product.getCategory());
    }

    @Test
    void testProductNoArgsConstructor() {
        Product newProduct = new Product();
        assertNotNull(newProduct);
        assertNull(newProduct.getId());
        assertNull(newProduct.getName());
        assertNull(newProduct.getPrice());
        assertNull(newProduct.getStockQuantity());
    }

    @Test
    void testProductAllArgsConstructor() {
        Product fullProduct = new Product(
                2L, "Full Product", "Full Description", 
                199.99, "full.jpg", 200, "Books"
        );
        assertNotNull(fullProduct);
        assertEquals(2L, fullProduct.getId());
        assertEquals("Full Product", fullProduct.getName());
        assertEquals(199.99, fullProduct.getPrice());
        assertEquals(200, fullProduct.getStockQuantity());
    }

    @Test
    void testSettersAndGetters() {
        product.setName("Updated Product");
        product.setPrice(149.99);
        product.setStockQuantity(50);
        product.setCategory("Updated Category");

        assertEquals("Updated Product", product.getName());
        assertEquals(149.99, product.getPrice());
        assertEquals(50, product.getStockQuantity());
        assertEquals("Updated Category", product.getCategory());
    }

    @Test
    void testToString() {
        String productString = product.toString();
        assertTrue(productString.contains("Test Product"));
        assertTrue(productString.contains("99.99"));
        assertTrue(productString.contains("100"));
    }

    @Test
    void testEqualsAndHashCode() {
        Product product1 = Product.builder()
                .id(1L)
                .name("Test Product")
                .price(99.99)
                .build();

        Product product2 = Product.builder()
                .id(1L)
                .name("Test Product")
                .price(99.99)
                .build();

        Product product3 = Product.builder()
                .id(2L)
                .name("Test Product")
                .price(99.99)
                .build();

        assertEquals(product1, product2);
        assertEquals(product1.hashCode(), product2.hashCode());
        assertNotEquals(product1, product3);
        assertNotEquals(product1.hashCode(), product3.hashCode());
    }

    @Test
    void testProductWithNullValues() {
        Product nullProduct = new Product();
        assertNull(nullProduct.getName());
        assertNull(nullProduct.getDescription());
        assertNull(nullProduct.getImageUrl());
        assertNull(nullProduct.getCategory());
    }

    @Test
    void testProductWithZeroStock() {
        Product zeroStockProduct = Product.builder()
                .id(3L)
                .name("Zero Stock Product")
                .price(0.0)
                .stockQuantity(0)
                .build();

        assertEquals(0, zeroStockProduct.getStockQuantity());
        assertEquals(0.0, zeroStockProduct.getPrice());
    }
}

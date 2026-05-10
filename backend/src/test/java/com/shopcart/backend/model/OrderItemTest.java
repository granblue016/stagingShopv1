package com.shopcart.backend.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class OrderItemTest {

    private OrderItem orderItem;
    private Order order;

    @BeforeEach
    void setUp() {
        order = Order.builder()
                .orderId(1L)
                .userId(100L)
                .status("pending")
                .build();

        orderItem = OrderItem.builder()
                .id(1L)
                .order(order)
                .productId(1L)
                .name("Test Product")
                .quantity(2)
                .price(50.0)
                .stockQuantity(100)
                .imageUrl("test.jpg")
                .build();
    }

    @Test
    void testOrderItemBuilder() {
        assertNotNull(orderItem);
        assertEquals(1L, orderItem.getId());
        assertEquals(order, orderItem.getOrder());
        assertEquals(1L, orderItem.getProductId());
        assertEquals("Test Product", orderItem.getName());
        assertEquals(2, orderItem.getQuantity());
        assertEquals(50.0, orderItem.getPrice());
        assertEquals(100, orderItem.getStockQuantity());
        assertEquals("test.jpg", orderItem.getImageUrl());
    }

    @Test
    void testOrderItemNoArgsConstructor() {
        OrderItem newOrderItem = new OrderItem();
        assertNotNull(newOrderItem);
        assertNull(newOrderItem.getId());
        assertNull(newOrderItem.getOrder());
        assertNull(newOrderItem.getProductId());
        assertNull(newOrderItem.getName());
        assertNull(newOrderItem.getQuantity());
        assertNull(newOrderItem.getPrice());
        assertNull(newOrderItem.getStockQuantity());
        assertNull(newOrderItem.getImageUrl());
    }

    @Test
    void testOrderItemAllArgsConstructor() {
        OrderItem fullOrderItem = new OrderItem(
                2L, 3L, "Full Product", 75.0, 3, 150, "full.jpg", order
        );
        assertNotNull(fullOrderItem);
        assertEquals(2L, fullOrderItem.getId());
        assertEquals(order, fullOrderItem.getOrder());
        assertEquals(3L, fullOrderItem.getProductId());
        assertEquals("Full Product", fullOrderItem.getName());
        assertEquals(75.0, fullOrderItem.getPrice());
        assertEquals(3, fullOrderItem.getQuantity());
        assertEquals(150, fullOrderItem.getStockQuantity());
        assertEquals("full.jpg", fullOrderItem.getImageUrl());
    }

    @Test
    void testSettersAndGetters() {
        orderItem.setQuantity(5);
        orderItem.setPrice(25.0);
        orderItem.setName("Updated Product");
        orderItem.setStockQuantity(200);

        assertEquals(5, orderItem.getQuantity());
        assertEquals(25.0, orderItem.getPrice());
        assertEquals("Updated Product", orderItem.getName());
        assertEquals(200, orderItem.getStockQuantity());
    }

    @Test
    void testToString() {
        String orderItemString = orderItem.toString();
        assertTrue(orderItemString.contains("1"));
        assertTrue(orderItemString.contains("Test Product"));
        assertTrue(orderItemString.contains("50.0"));
    }

    @Test
    void testEqualsAndHashCode() {
        OrderItem orderItem1 = OrderItem.builder()
                .id(1L)
                .productId(1L)
                .name("Test Product")
                .quantity(2)
                .price(50.0)
                .build();

        OrderItem orderItem2 = OrderItem.builder()
                .id(1L)
                .productId(1L)
                .name("Test Product")
                .quantity(2)
                .price(50.0)
                .build();

        OrderItem orderItem3 = OrderItem.builder()
                .id(2L)
                .productId(1L)
                .name("Test Product")
                .quantity(2)
                .price(50.0)
                .build();

        assertEquals(orderItem1, orderItem2);
        assertEquals(orderItem1.hashCode(), orderItem2.hashCode());
        assertNotEquals(orderItem1, orderItem3);
        assertNotEquals(orderItem1.hashCode(), orderItem3.hashCode());
    }

    @Test
    void testOrderItemWithNullValues() {
        OrderItem nullOrderItem = new OrderItem();
        assertNull(nullOrderItem.getOrder());
        assertNull(nullOrderItem.getProductId());
        assertNull(nullOrderItem.getName());
        assertNull(nullOrderItem.getQuantity());
        assertNull(nullOrderItem.getPrice());
        assertNull(nullOrderItem.getStockQuantity());
        assertNull(nullOrderItem.getImageUrl());
    }

    @Test
    void testOrderItemWithZeroQuantity() {
        OrderItem zeroQuantityItem = OrderItem.builder()
                .id(3L)
                .productId(2L)
                .name("Zero Product")
                .quantity(0)
                .price(0.0)
                .stockQuantity(0)
                .build();

        assertEquals(0, zeroQuantityItem.getQuantity());
        assertEquals(0.0, zeroQuantityItem.getPrice());
        assertEquals(0, zeroQuantityItem.getStockQuantity());
    }

    @Test
    void testOrderItemWithDifferentProduct() {
        OrderItem differentOrderItem = OrderItem.builder()
                .id(4L)
                .productId(5L)
                .name("Different Product")
                .quantity(1)
                .price(100.0)
                .stockQuantity(50)
                .imageUrl("different.jpg")
                .build();

        assertEquals(5L, differentOrderItem.getProductId());
        assertEquals("Different Product", differentOrderItem.getName());
        assertEquals(100.0, differentOrderItem.getPrice());
        assertEquals(50, differentOrderItem.getStockQuantity());
        assertEquals("different.jpg", differentOrderItem.getImageUrl());
    }
}

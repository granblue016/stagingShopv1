package com.shopcart.backend.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class OrderTest {

    private Order order;
    private ShippingInfo shippingInfo;
    private List<OrderItem> items;

    @BeforeEach
    void setUp() {
        shippingInfo = ShippingInfo.builder()
                .address("123 Test St")
                .city("Test City")
                .postalCode("12345")
                .build();

        OrderItem item1 = OrderItem.builder()
                .id(1L)
                .quantity(2)
                .price(50.0)
                .build();

        OrderItem item2 = OrderItem.builder()
                .id(2L)
                .quantity(1)
                .price(30.0)
                .build();

        items = Arrays.asList(item1, item2);

        order = Order.builder()
                .orderId(1L)
                .userId(100L)
                .status("pending")
                .subtotal(130.0)
                .discount(10.0)
                .shippingFee(5.0)
                .total(125.0)
                .shipping(shippingInfo)
                .items(items)
                .build();
    }

    @Test
    void testOrderBuilder() {
        assertNotNull(order);
        assertEquals(1L, order.getOrderId());
        assertEquals(100L, order.getUserId());
        assertEquals("pending", order.getStatus());
        assertEquals(130.0, order.getSubtotal());
        assertEquals(10.0, order.getDiscount());
        assertEquals(5.0, order.getShippingFee());
        assertEquals(125.0, order.getTotal());
        assertNotNull(order.getShipping());
        assertEquals(2, order.getItems().size());
    }

    @Test
    void testOrderNoArgsConstructor() {
        Order newOrder = new Order();
        assertNotNull(newOrder);
        assertNull(newOrder.getOrderId());
        assertNull(newOrder.getUserId());
        assertNull(newOrder.getStatus());
        assertNotNull(newOrder.getItems()); // Should be initialized as empty list
        assertTrue(newOrder.getItems().isEmpty());
    }

    @Test
    void testOrderAllArgsConstructor() {
        Order fullOrder = new Order(
                2L, 200L, "completed", 200.0, 20.0, 10.0, 190.0,
                shippingInfo, LocalDateTime.now(), items
        );
        assertNotNull(fullOrder);
        assertEquals(2L, fullOrder.getOrderId());
        assertEquals(200L, fullOrder.getUserId());
        assertEquals("completed", fullOrder.getStatus());
    }

    @Test
    void testSettersAndGetters() {
        order.setStatus("completed");
        order.setTotal(200.0);
        order.setUserId(300L);

        assertEquals("completed", order.getStatus());
        assertEquals(200.0, order.getTotal());
        assertEquals(300L, order.getUserId());
    }

    @Test
    void testPrePersist() {
        Order testOrder = new Order();
        testOrder.setUserId(123L);
        testOrder.setSubtotal(100.0);
        testOrder.setTotal(100.0);
        
        // Simulate @PrePersist
        testOrder.onCreate();
        
        assertNotNull(testOrder.getCreatedAt());
        assertEquals("pending", testOrder.getStatus()); // Default status
        assertTrue(testOrder.getCreatedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
    }

    @Test
    void testPrePersistWithExistingStatus() {
        Order testOrder = new Order();
        testOrder.setStatus("completed");
        
        testOrder.onCreate();
        
        assertEquals("completed", testOrder.getStatus()); // Should not change existing status
    }

    @Test
    void testToString() {
        String orderString = order.toString();
        assertTrue(orderString.contains("1"));
        assertTrue(orderString.contains("pending"));
        assertTrue(orderString.contains("125.0"));
    }

    @Test
    void testEqualsAndHashCode() {
        Order order1 = Order.builder()
                .orderId(1L)
                .userId(100L)
                .status("pending")
                .build();

        Order order2 = Order.builder()
                .orderId(1L)
                .userId(100L)
                .status("pending")
                .build();

        Order order3 = Order.builder()
                .orderId(2L)
                .userId(100L)
                .status("pending")
                .build();

        assertEquals(order1, order2);
        assertEquals(order1.hashCode(), order2.hashCode());
        assertNotEquals(order1, order3);
        assertNotEquals(order1.hashCode(), order3.hashCode());
    }

    @Test
    void testOrderWithNullShipping() {
        Order orderWithoutShipping = Order.builder()
                .orderId(3L)
                .userId(400L)
                .status("cancelled")
                .build();

        assertNull(orderWithoutShipping.getShipping());
        assertEquals("cancelled", orderWithoutShipping.getStatus());
    }

    @Test
    void testOrderWithEmptyItems() {
        Order emptyOrder = Order.builder()
                .orderId(4L)
                .userId(500L)
                .items(new java.util.ArrayList<>())
                .build();

        assertNotNull(emptyOrder.getItems());
        assertTrue(emptyOrder.getItems().isEmpty());
    }
}

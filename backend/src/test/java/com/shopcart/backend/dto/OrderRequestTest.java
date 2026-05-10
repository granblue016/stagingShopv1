package com.shopcart.backend.dto;

import com.shopcart.backend.model.ShippingInfo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class OrderRequestTest {

    private OrderRequest orderRequest;
    private List<OrderRequest.CartItemDTO> cartItems;
    private ShippingInfo shippingInfo;

    @BeforeEach
    void setUp() {
        OrderRequest.CartItemDTO item1 = OrderRequest.CartItemDTO.builder()
                .productId(1L)
                .quantity(2)
                .build();

        OrderRequest.CartItemDTO item2 = OrderRequest.CartItemDTO.builder()
                .productId(2L)
                .quantity(1)
                .build();

        cartItems = Arrays.asList(item1, item2);

        shippingInfo = ShippingInfo.builder()
                .fullName("Test User")
                .email("test@example.com")
                .address("123 Test Street")
                .city("Test City")
                .postalCode("12345")
                .phone("123-456-7890")
                .build();

        orderRequest = OrderRequest.builder()
                .cartItems(cartItems)
                .subtotal(150.0)
                .discount(10.0)
                .shippingFee(5.0)
                .total(145.0)
                .couponCode("SAVE10")
                .shipping(shippingInfo)
                .build();
    }

    @Test
    void testOrderRequestBuilder() {
        assertNotNull(orderRequest);
        assertEquals(cartItems, orderRequest.getCartItems());
        assertEquals(150.0, orderRequest.getSubtotal());
        assertEquals(10.0, orderRequest.getDiscount());
        assertEquals(5.0, orderRequest.getShippingFee());
        assertEquals(145.0, orderRequest.getTotal());
        assertEquals("SAVE10", orderRequest.getCouponCode());
        assertEquals(shippingInfo, orderRequest.getShipping());
    }

    @Test
    void testOrderRequestNoArgsConstructor() {
        OrderRequest newOrderRequest = new OrderRequest();
        assertNotNull(newOrderRequest);
        assertNull(newOrderRequest.getCartItems());
        assertNull(newOrderRequest.getSubtotal());
        assertNull(newOrderRequest.getDiscount());
        assertNull(newOrderRequest.getShippingFee());
        assertNull(newOrderRequest.getTotal());
        assertNull(newOrderRequest.getCouponCode());
        assertNull(newOrderRequest.getShipping());
    }

    @Test
    void testOrderRequestAllArgsConstructor() {
        OrderRequest fullOrderRequest = new OrderRequest(
                cartItems, 200.0, 20.0, 10.0, 190.0, "SAVE20", shippingInfo
        );
        assertNotNull(fullOrderRequest);
        assertEquals(cartItems, fullOrderRequest.getCartItems());
        assertEquals(200.0, fullOrderRequest.getSubtotal());
        assertEquals(20.0, fullOrderRequest.getDiscount());
        assertEquals(10.0, fullOrderRequest.getShippingFee());
        assertEquals(190.0, fullOrderRequest.getTotal());
        assertEquals("SAVE20", fullOrderRequest.getCouponCode());
        assertEquals(shippingInfo, fullOrderRequest.getShipping());
    }

    @Test
    void testSettersAndGetters() {
        List<OrderRequest.CartItemDTO> newCartItems = Arrays.asList(
                OrderRequest.CartItemDTO.builder()
                        .productId(3L)
                        .quantity(1)
                        .build()
        );

        orderRequest.setCartItems(newCartItems);
        orderRequest.setSubtotal(100.0);
        orderRequest.setDiscount(5.0);
        orderRequest.setShippingFee(2.5);
        orderRequest.setTotal(97.5);
        orderRequest.setCouponCode("NEW5");

        assertEquals(newCartItems, orderRequest.getCartItems());
        assertEquals(100.0, orderRequest.getSubtotal());
        assertEquals(5.0, orderRequest.getDiscount());
        assertEquals(2.5, orderRequest.getShippingFee());
        assertEquals(97.5, orderRequest.getTotal());
        assertEquals("NEW5", orderRequest.getCouponCode());
    }

    @Test
    void testToString() {
        String orderRequestString = orderRequest.toString();
        assertTrue(orderRequestString.contains("150.0"));
        assertTrue(orderRequestString.contains("SAVE10"));
        assertTrue(orderRequestString.contains("Test User"));
    }

    @Test
    void testEqualsAndHashCode() {
        OrderRequest orderRequest1 = OrderRequest.builder()
                .cartItems(cartItems)
                .subtotal(150.0)
                .discount(10.0)
                .shippingFee(5.0)
                .total(145.0)
                .couponCode("SAVE10")
                .shipping(shippingInfo)
                .build();

        OrderRequest orderRequest2 = OrderRequest.builder()
                .cartItems(cartItems)
                .subtotal(150.0)
                .discount(10.0)
                .shippingFee(5.0)
                .total(145.0)
                .couponCode("SAVE10")
                .shipping(shippingInfo)
                .build();

        OrderRequest orderRequest3 = OrderRequest.builder()
                .cartItems(cartItems)
                .subtotal(200.0)
                .discount(10.0)
                .shippingFee(5.0)
                .total(195.0)
                .couponCode("SAVE10")
                .shipping(shippingInfo)
                .build();

        assertEquals(orderRequest1, orderRequest2);
        assertEquals(orderRequest1.hashCode(), orderRequest2.hashCode());
        assertNotEquals(orderRequest1, orderRequest3);
        assertNotEquals(orderRequest1.hashCode(), orderRequest3.hashCode());
    }

    @Test
    void testCartItemDTO() {
        OrderRequest.CartItemDTO cartItem = OrderRequest.CartItemDTO.builder()
                .productId(5L)
                .quantity(3)
                .build();

        assertEquals(5L, cartItem.getProductId());
        assertEquals(3, cartItem.getQuantity());

        cartItem.setProductId(10L);
        cartItem.setQuantity(5);

        assertEquals(10L, cartItem.getProductId());
        assertEquals(5, cartItem.getQuantity());
    }

    @Test
    void testCartItemDTONoArgsConstructor() {
        OrderRequest.CartItemDTO cartItem = new OrderRequest.CartItemDTO();
        assertNotNull(cartItem);
        assertNull(cartItem.getProductId());
        assertNull(cartItem.getQuantity());
    }

    @Test
    void testCartItemDTOAllArgsConstructor() {
        OrderRequest.CartItemDTO cartItem = new OrderRequest.CartItemDTO(7L, 4);
        assertEquals(7L, cartItem.getProductId());
        assertEquals(4, cartItem.getQuantity());
    }

    @Test
    void testOrderRequestWithNullValues() {
        OrderRequest nullOrderRequest = new OrderRequest();
        assertNull(nullOrderRequest.getCartItems());
        assertNull(nullOrderRequest.getSubtotal());
        assertNull(nullOrderRequest.getDiscount());
        assertNull(nullOrderRequest.getShippingFee());
        assertNull(nullOrderRequest.getTotal());
        assertNull(nullOrderRequest.getCouponCode());
        assertNull(nullOrderRequest.getShipping());
    }

    @Test
    void testOrderRequestWithEmptyCart() {
        OrderRequest emptyCartRequest = OrderRequest.builder()
                .cartItems(Arrays.asList())
                .subtotal(0.0)
                .discount(0.0)
                .shippingFee(0.0)
                .total(0.0)
                .build();

        assertNotNull(emptyCartRequest.getCartItems());
        assertTrue(emptyCartRequest.getCartItems().isEmpty());
        assertEquals(0.0, emptyCartRequest.getSubtotal());
        assertEquals(0.0, emptyCartRequest.getTotal());
    }
}

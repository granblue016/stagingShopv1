package com.shopcart.backend.service;

import com.shopcart.backend.dto.OrderRequest;
import com.shopcart.backend.model.Coupon;
import com.shopcart.backend.model.Order;
import com.shopcart.backend.model.OrderItem;
import com.shopcart.backend.model.Product;
import com.shopcart.backend.model.ShippingInfo;
import com.shopcart.backend.repository.CouponRepository;
import com.shopcart.backend.repository.OrderRepository;
import com.shopcart.backend.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private OrderService orderService;

    private OrderRequest orderRequest;
    private Product product;
    private ShippingInfo shippingInfo;

    @BeforeEach
    void setUp() {
        shippingInfo = ShippingInfo.builder()
                .address("123 Test St")
                .city("Test City")
                .postalCode("12345")
                .build();

        product = Product.builder()
                .id(1L)
                .name("Test Product")
                .price(100.0)
                .stockQuantity(10)
                .imageUrl("http://test.com/image.jpg")
                .build();

        OrderRequest.CartItemDTO cartItem = OrderRequest.CartItemDTO.builder()
                .productId(1L)
                .quantity(2)
                .build();

        orderRequest = OrderRequest.builder()
                .cartItems(List.of(cartItem))
                .subtotal(200.0)
                .discount(0.0)
                .shippingFee(10.0)
                .total(210.0)
                .shipping(shippingInfo)
                .build();
    }

    @Test
    void createOrder_SuccessfulOrder() {
        // Arrange
        Long userId = 1L;
        when(productRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Order result = orderService.createOrder(orderRequest, userId);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals(200.0, result.getSubtotal());
        assertEquals(210.0, result.getTotal());
        assertEquals("pending", result.getStatus());
        assertNotNull(result.getItems());
        assertEquals(1, result.getItems().size());
        
        // Verify stock was reduced
        assertEquals(8, product.getStockQuantity());
        
        // Verify interactions
        verify(productRepository).findByIdForUpdate(1L);
        verify(productRepository).save(product);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void createOrder_InsufficientStock_ThrowsException() {
        // Arrange
        Long userId = 1L;
        product.setStockQuantity(1); // Only 1 item in stock, but requesting 2
        when(productRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(product));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.createOrder(orderRequest, userId);
        });
        
        assertTrue(exception.getMessage().contains("không đủ hàng"));
        verify(productRepository, never()).save(any(Product.class));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void createOrder_ProductNotFound_ThrowsException() {
        // Arrange
        Long userId = 1L;
        when(productRepository.findByIdForUpdate(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.createOrder(orderRequest, userId);
        });
        
        assertTrue(exception.getMessage().contains("không tồn tại"));
        verify(productRepository, never()).save(any(Product.class));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void createOrder_MultipleItems_Success() {
        // Arrange
        Long userId = 1L;
        Product product2 = Product.builder()
                .id(2L)
                .name("Test Product 2")
                .price(50.0)
                .stockQuantity(5)
                .imageUrl("http://test.com/image2.jpg")
                .build();

        OrderRequest.CartItemDTO cartItem2 = OrderRequest.CartItemDTO.builder()
                .productId(2L)
                .quantity(1)
                .build();

        OrderRequest multiItemRequest = OrderRequest.builder()
                .cartItems(List.of(
                        orderRequest.getCartItems().get(0),
                        cartItem2
                ))
                .subtotal(250.0)
                .discount(0.0)
                .shippingFee(10.0)
                .total(260.0)
                .shipping(shippingInfo)
                .build();

        when(productRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(product));
        when(productRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(product2));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Order result = orderService.createOrder(multiItemRequest, userId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.getItems().size());
        assertEquals(8, product.getStockQuantity()); // 10 - 2
        assertEquals(4, product2.getStockQuantity()); // 5 - 1
        
        verify(productRepository, times(2)).save(any(Product.class));
    }

    @Test
    void getUserOrders_Success() {
        // Arrange
        Long userId = 1L;
        Order order1 = Order.builder().orderId(1L).userId(userId).build();
        Order order2 = Order.builder().orderId(2L).userId(userId).build();
        List<Order> expectedOrders = List.of(order2, order1); // Should be ordered by createdAt desc

        when(orderRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(expectedOrders);

        // Act
        List<Order> result = orderService.getUserOrders(userId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(orderRepository).findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Test
    void createOrder_WithPercentCoupon_DiscountAppliedCorrectly() {
        // Arrange
        Long userId = 1L;
        Coupon coupon = Coupon.builder()
                .id(1L)
                .code("SAVE10")
                .type("PERCENT")
                .value(10.0)
                .expiryDate(LocalDateTime.now().plusDays(30))
                .active(true)
                .build();

        OrderRequest requestWithCoupon = OrderRequest.builder()
                .cartItems(List.of(OrderRequest.CartItemDTO.builder()
                        .productId(1L)
                        .quantity(2)
                        .build()))
                .subtotal(200.0) // 2 items at 100 each
                .discount(0.0)
                .shippingFee(50000.0) // 50k shipping fee
                .total(0.0) // Will be calculated
                .couponCode("SAVE10")
                .shipping(shippingInfo)
                .build();

        when(productRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(couponRepository.findByCodeAndActiveTrue("SAVE10")).thenReturn(Optional.of(coupon));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Order result = orderService.createOrder(requestWithCoupon, userId);

        // Assert
        assertNotNull(result);
        assertEquals(200.0, result.getSubtotal());
        assertEquals(20.0, result.getDiscount()); // 10% of 200 = 20
        assertEquals(50000.0, result.getShippingFee());
        assertEquals(50180.0, result.getTotal()); // 200 - 20 + 50000 = 50180
        assertEquals("pending", result.getStatus());
    }

    @Test
    void createOrder_WithFixedCoupon_DiscountAppliedCorrectly() {
        // Arrange
        Long userId = 1L;
        Coupon coupon = Coupon.builder()
                .id(2L)
                .code("FIXED20")
                .type("FIXED")
                .value(20.0)
                .expiryDate(LocalDateTime.now().plusDays(30))
                .active(true)
                .build();

        OrderRequest requestWithCoupon = OrderRequest.builder()
                .cartItems(List.of(OrderRequest.CartItemDTO.builder()
                        .productId(1L)
                        .quantity(2)
                        .build()))
                .subtotal(200.0)
                .discount(0.0)
                .shippingFee(50000.0)
                .total(0.0)
                .couponCode("FIXED20")
                .shipping(shippingInfo)
                .build();

        when(productRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(couponRepository.findByCodeAndActiveTrue("FIXED20")).thenReturn(Optional.of(coupon));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Order result = orderService.createOrder(requestWithCoupon, userId);

        // Assert
        assertNotNull(result);
        assertEquals(200.0, result.getSubtotal());
        assertEquals(20.0, result.getDiscount()); // Fixed 20
        assertEquals(50000.0, result.getShippingFee());
        assertEquals(50180.0, result.getTotal()); // 200 - 20 + 50000 = 50180
    }

    @Test
    void createOrder_WithExpiredCoupon_ThrowsException() {
        // Arrange
        Long userId = 1L;
        Coupon expiredCoupon = Coupon.builder()
                .id(3L)
                .code("EXPIRED")
                .type("PERCENT")
                .value(10.0)
                .expiryDate(LocalDateTime.now().minusDays(1))
                .active(true)
                .build();

        OrderRequest requestWithCoupon = OrderRequest.builder()
                .cartItems(List.of(OrderRequest.CartItemDTO.builder()
                        .productId(1L)
                        .quantity(2)
                        .build()))
                .subtotal(200.0)
                .discount(0.0)
                .shippingFee(50000.0)
                .total(0.0)
                .couponCode("EXPIRED")
                .shipping(shippingInfo)
                .build();

        when(couponRepository.findByCodeAndActiveTrue("EXPIRED")).thenReturn(Optional.of(expiredCoupon));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.createOrder(requestWithCoupon, userId);
        });

        assertTrue(exception.getMessage().contains("hết hạn"));
        verify(productRepository, never()).findByIdForUpdate(anyLong());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void createOrder_WithInvalidCoupon_ThrowsException() {
        // Arrange
        Long userId = 1L;
        OrderRequest requestWithCoupon = OrderRequest.builder()
                .cartItems(List.of(OrderRequest.CartItemDTO.builder()
                        .productId(1L)
                        .quantity(2)
                        .build()))
                .subtotal(200.0)
                .discount(0.0)
                .shippingFee(50000.0)
                .total(0.0)
                .couponCode("INVALID")
                .shipping(shippingInfo)
                .build();

        when(couponRepository.findByCodeAndActiveTrue("INVALID")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.createOrder(requestWithCoupon, userId);
        });

        assertTrue(exception.getMessage().contains("không hợp lệ"));
        verify(productRepository, never()).findByIdForUpdate(anyLong());
        verify(orderRepository, never()).save(any(Order.class));
    }
}

package com.shopcart.backend.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class CouponTest {

    private Coupon coupon;

    @BeforeEach
    void setUp() {
        coupon = Coupon.builder()
                .id(1L)
                .code("TEST10")
                .type("PERCENT")
                .value(10.0)
                .expiryDate(LocalDateTime.now().plusDays(30))
                .active(true)
                .minSpend(50.0)
                .maxDiscount(100.0)
                .usageLimit(100)
                .usedCount(5)
                .build();
    }

    @Test
    void testCouponBuilder() {
        assertNotNull(coupon);
        assertEquals(1L, coupon.getId());
        assertEquals("TEST10", coupon.getCode());
        assertEquals("PERCENT", coupon.getType());
        assertEquals(10.0, coupon.getValue());
        assertTrue(coupon.getActive());
        assertEquals(50.0, coupon.getMinSpend());
        assertEquals(100.0, coupon.getMaxDiscount());
        assertEquals(100, coupon.getUsageLimit());
        assertEquals(5, coupon.getUsedCount());
    }

    @Test
    void testCouponNoArgsConstructor() {
        Coupon newCoupon = new Coupon();
        assertNotNull(newCoupon);
        assertNull(newCoupon.getId());
        assertNull(newCoupon.getCode());
        assertNull(newCoupon.getType());
        assertTrue(newCoupon.getActive()); // Default value
        assertEquals(0.0, newCoupon.getMinSpend()); // Default value
        assertEquals(0, newCoupon.getUsedCount()); // Default value
    }

    @Test
    void testCouponAllArgsConstructor() {
        LocalDateTime expiry = LocalDateTime.now().plusDays(60);
        Coupon fullCoupon = new Coupon(
                2L, "FULL20", "FIXED", 20.0, expiry, false,
                100.0, 50.0, 200, 10, LocalDateTime.now()
        );
        assertNotNull(fullCoupon);
        assertEquals(2L, fullCoupon.getId());
        assertEquals("FULL20", fullCoupon.getCode());
        assertEquals("FIXED", fullCoupon.getType());
        assertFalse(fullCoupon.getActive());
    }

    @Test
    void testSettersAndGetters() {
        coupon.setCode("UPDATED20");
        coupon.setType("FIXED");
        coupon.setValue(20.0);
        coupon.setActive(false);

        assertEquals("UPDATED20", coupon.getCode());
        assertEquals("FIXED", coupon.getType());
        assertEquals(20.0, coupon.getValue());
        assertFalse(coupon.getActive());
    }

    @Test
    void testPrePersist() {
        Coupon testCoupon = new Coupon();
        testCoupon.setCode("PERSIST10");
        testCoupon.setType("PERCENT");
        testCoupon.setValue(10.0);
        testCoupon.setExpiryDate(LocalDateTime.now().plusDays(30));
        
        // Simulate @PrePersist
        testCoupon.onCreate();
        
        assertNotNull(testCoupon.getCreatedAt());
        assertTrue(testCoupon.getCreatedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
    }

    @Test
    void testCouponWithDefaults() {
        Coupon defaultCoupon = Coupon.builder()
                .code("DEFAULT")
                .type("PERCENT")
                .value(15.0)
                .expiryDate(LocalDateTime.now().plusDays(15))
                .build();

        assertTrue(defaultCoupon.getActive()); // Default true
        assertEquals(0.0, defaultCoupon.getMinSpend()); // Default 0.0
        assertEquals(0, defaultCoupon.getUsedCount()); // Default 0
    }

    @Test
    void testToString() {
        String couponString = coupon.toString();
        assertTrue(couponString.contains("TEST10"));
        assertTrue(couponString.contains("PERCENT"));
        assertTrue(couponString.contains("10.0"));
    }

    @Test
    void testEqualsAndHashCode() {
        Coupon coupon1 = Coupon.builder()
                .id(1L)
                .code("EQUALS10")
                .type("PERCENT")
                .value(10.0)
                .build();

        Coupon coupon2 = Coupon.builder()
                .id(1L)
                .code("EQUALS10")
                .type("PERCENT")
                .value(10.0)
                .build();

        Coupon coupon3 = Coupon.builder()
                .id(2L)
                .code("EQUALS10")
                .type("PERCENT")
                .value(10.0)
                .build();

        assertEquals(coupon1, coupon2);
        assertEquals(coupon1.hashCode(), coupon2.hashCode());
        assertNotEquals(coupon1, coupon3);
        assertNotEquals(coupon1.hashCode(), coupon3.hashCode());
    }

    @Test
    void testCouponWithNullValues() {
        Coupon nullCoupon = new Coupon();
        assertNull(nullCoupon.getCode());
        assertNull(nullCoupon.getType());
        assertNull(nullCoupon.getValue());
        assertNull(nullCoupon.getExpiryDate());
        assertNull(nullCoupon.getMaxDiscount());
        assertNull(nullCoupon.getUsageLimit());
    }

    @Test
    void testCouponWithZeroValues() {
        Coupon zeroCoupon = Coupon.builder()
                .id(3L)
                .code("ZERO")
                .type("PERCENT")
                .value(0.0)
                .minSpend(0.0)
                .usedCount(0)
                .build();

        assertEquals(0.0, zeroCoupon.getValue());
        assertEquals(0.0, zeroCoupon.getMinSpend());
        assertEquals(0, zeroCoupon.getUsedCount());
    }

    @Test
    void testFixedTypeCoupon() {
        Coupon fixedCoupon = Coupon.builder()
                .id(4L)
                .code("FIXED25")
                .type("FIXED")
                .value(25.0)
                .expiryDate(LocalDateTime.now().plusDays(45))
                .build();

        assertEquals("FIXED", fixedCoupon.getType());
        assertEquals(25.0, fixedCoupon.getValue());
    }
}

package com.shopcart.backend.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class ShippingInfoTest {

    private ShippingInfo shippingInfo;

    @BeforeEach
    void setUp() {
        shippingInfo = ShippingInfo.builder()
                .fullName("Test User")
                .email("test@example.com")
                .address("123 Test Street")
                .city("Test City")
                .postalCode("12345")
                .country("Vietnam")
                .phone("123-456-7890")
                .build();
    }

    @Test
    void testShippingInfoBuilder() {
        assertNotNull(shippingInfo);
        assertEquals("Test User", shippingInfo.getFullName());
        assertEquals("test@example.com", shippingInfo.getEmail());
        assertEquals("123 Test Street", shippingInfo.getAddress());
        assertEquals("Test City", shippingInfo.getCity());
        assertEquals("12345", shippingInfo.getPostalCode());
        assertEquals("Vietnam", shippingInfo.getCountry());
        assertEquals("123-456-7890", shippingInfo.getPhone());
    }

    @Test
    void testShippingInfoNoArgsConstructor() {
        ShippingInfo newShippingInfo = new ShippingInfo();
        assertNotNull(newShippingInfo);
        assertNull(newShippingInfo.getFullName());
        assertNull(newShippingInfo.getEmail());
        assertNull(newShippingInfo.getAddress());
        assertNull(newShippingInfo.getCity());
        assertNull(newShippingInfo.getPostalCode());
        assertNull(newShippingInfo.getPhone());
    }

    @Test
    void testShippingInfoAllArgsConstructor() {
        ShippingInfo fullShippingInfo = new ShippingInfo(
                "Full User", "full@example.com", "456 Full Street", 
                "Full City", "67890", "USA", "987-654-3210"
        );
        assertNotNull(fullShippingInfo);
        assertEquals("Full User", fullShippingInfo.getFullName());
        assertEquals("full@example.com", fullShippingInfo.getEmail());
        assertEquals("456 Full Street", fullShippingInfo.getAddress());
        assertEquals("Full City", fullShippingInfo.getCity());
        assertEquals("67890", fullShippingInfo.getPostalCode());
        assertEquals("USA", fullShippingInfo.getCountry());
        assertEquals("987-654-3210", fullShippingInfo.getPhone());
    }

    @Test
    void testSettersAndGetters() {
        shippingInfo.setFullName("Updated User");
        shippingInfo.setEmail("updated@example.com");
        shippingInfo.setAddress("789 Updated Street");
        shippingInfo.setCity("Updated City");
        shippingInfo.setPostalCode("54321");
        shippingInfo.setCountry("Japan");
        shippingInfo.setPhone("555-123-4567");

        assertEquals("Updated User", shippingInfo.getFullName());
        assertEquals("updated@example.com", shippingInfo.getEmail());
        assertEquals("789 Updated Street", shippingInfo.getAddress());
        assertEquals("Updated City", shippingInfo.getCity());
        assertEquals("54321", shippingInfo.getPostalCode());
        assertEquals("Japan", shippingInfo.getCountry());
        assertEquals("555-123-4567", shippingInfo.getPhone());
    }

    @Test
    void testToString() {
        String shippingInfoString = shippingInfo.toString();
        assertTrue(shippingInfoString.contains("Test User"));
        assertTrue(shippingInfoString.contains("123 Test Street"));
        assertTrue(shippingInfoString.contains("Test City"));
        assertTrue(shippingInfoString.contains("12345"));
    }

    @Test
    void testEqualsAndHashCode() {
        ShippingInfo shippingInfo1 = ShippingInfo.builder()
                .fullName("Test User")
                .email("test@example.com")
                .address("123 Test Street")
                .city("Test City")
                .postalCode("12345")
                .phone("123-456-7890")
                .build();

        ShippingInfo shippingInfo2 = ShippingInfo.builder()
                .fullName("Test User")
                .email("test@example.com")
                .address("123 Test Street")
                .city("Test City")
                .postalCode("12345")
                .phone("123-456-7890")
                .build();

        ShippingInfo shippingInfo3 = ShippingInfo.builder()
                .fullName("Different User")
                .email("test@example.com")
                .address("123 Test Street")
                .city("Test City")
                .postalCode("12345")
                .phone("123-456-7890")
                .build();

        assertEquals(shippingInfo1, shippingInfo2);
        assertEquals(shippingInfo1.hashCode(), shippingInfo2.hashCode());
        assertNotEquals(shippingInfo1, shippingInfo3);
        assertNotEquals(shippingInfo1.hashCode(), shippingInfo3.hashCode());
    }

    @Test
    void testShippingInfoWithNullValues() {
        ShippingInfo nullShippingInfo = new ShippingInfo();
        assertNull(nullShippingInfo.getFullName());
        assertNull(nullShippingInfo.getEmail());
        assertNull(nullShippingInfo.getAddress());
        assertNull(nullShippingInfo.getCity());
        assertNull(nullShippingInfo.getPostalCode());
        assertNull(nullShippingInfo.getPhone());
    }

    @Test
    void testShippingInfoWithEmptyValues() {
        ShippingInfo emptyShippingInfo = ShippingInfo.builder()
                .fullName("")
                .email("")
                .address("")
                .city("")
                .postalCode("")
                .phone("")
                .build();

        assertEquals("", emptyShippingInfo.getFullName());
        assertEquals("", emptyShippingInfo.getEmail());
        assertEquals("", emptyShippingInfo.getAddress());
        assertEquals("", emptyShippingInfo.getCity());
        assertEquals("", emptyShippingInfo.getPostalCode());
        assertEquals("", emptyShippingInfo.getPhone());
    }

    @Test
    void testShippingInfoWithPartialData() {
        ShippingInfo partialShippingInfo = ShippingInfo.builder()
                .fullName("Partial User")
                .address("123 Partial Street")
                .city("Partial City")
                .build();

        assertEquals("Partial User", partialShippingInfo.getFullName());
        assertEquals("123 Partial Street", partialShippingInfo.getAddress());
        assertEquals("Partial City", partialShippingInfo.getCity());
        assertNull(partialShippingInfo.getEmail());
        assertNull(partialShippingInfo.getPostalCode());
        assertNull(partialShippingInfo.getPhone());
    }
}

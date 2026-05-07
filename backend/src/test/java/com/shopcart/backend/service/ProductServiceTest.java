package com.shopcart.backend.service;

import com.shopcart.backend.model.Product;
import com.shopcart.backend.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product product;

    @BeforeEach
    void setUp() {
        product = Product.builder()
                .id(1L)
                .name("Test Product")
                .description("Test Description")
                .price(100.0)
                .imageUrl("http://test.com/image.jpg")
                .stockQuantity(10)
                .category("Electronics")
                .build();
    }

    @Test
    void getAllProducts_Success() {
        // Arrange
        List<Product> expectedProducts = List.of(product);
        when(productRepository.findAll()).thenReturn(expectedProducts);

        // Act
        List<Product> result = productService.getAllProducts();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(product.getName(), result.get(0).getName());
        verify(productRepository).findAll();
    }

    @Test
    void getProductById_Success() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // Act
        Optional<Product> result = productService.getProductById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(product.getName(), result.get().getName());
        verify(productRepository).findById(1L);
    }

    @Test
    void getProductById_NotFound() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        Optional<Product> result = productService.getProductById(1L);

        // Assert
        assertFalse(result.isPresent());
        verify(productRepository).findById(1L);
    }

    @Test
    void updateProduct_Success() {
        // Arrange
        Product updatedProduct = Product.builder()
                .name("Updated Product")
                .price(150.0)
                .description("Updated Description")
                .imageUrl("http://test.com/updated.jpg")
                .category("Updated Category")
                .stockQuantity(20)
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        // Act
        Product result = productService.updateProduct(1L, updatedProduct);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Product", result.getName());
        assertEquals(150.0, result.getPrice());
        assertEquals("Updated Description", result.getDescription());
        assertEquals("http://test.com/updated.jpg", result.getImageUrl());
        assertEquals("Updated Category", result.getCategory());
        assertEquals(20, result.getStockQuantity());
        
        verify(productRepository).findById(1L);
        verify(productRepository).save(product);
    }

    @Test
    void updateProduct_ProductNotFound_ThrowsException() {
        // Arrange
        Product updatedProduct = Product.builder().build();
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.updateProduct(1L, updatedProduct);
        });
        
        assertTrue(exception.getMessage().contains("Không tìm thấy sản phẩm"));
        verify(productRepository).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void updateStock_Success() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        // Act
        Product result = productService.updateStock(1L, 50);

        // Assert
        assertNotNull(result);
        assertEquals(50, result.getStockQuantity());
        verify(productRepository).findById(1L);
        verify(productRepository).save(product);
    }

    @Test
    void updateStock_ProductNotFound_ThrowsException() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.updateStock(1L, 50);
        });
        
        assertTrue(exception.getMessage().contains("Không tìm thấy sản phẩm"));
        verify(productRepository).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void createProduct_Success() {
        // Arrange
        when(productRepository.save(any(Product.class))).thenReturn(product);

        // Act
        Product result = productService.createProduct(product);

        // Assert
        assertNotNull(result);
        assertEquals(product.getName(), result.getName());
        verify(productRepository).save(product);
    }

    @Test
    void deleteProduct_Success() {
        // Arrange
        when(productRepository.existsById(1L)).thenReturn(true);
        doNothing().when(productRepository).deleteById(1L);

        // Act
        productService.deleteProduct(1L);

        // Assert
        verify(productRepository).existsById(1L);
        verify(productRepository).deleteById(1L);
    }

    @Test
    void deleteProduct_ProductNotFound_ThrowsException() {
        // Arrange
        when(productRepository.existsById(1L)).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.deleteProduct(1L);
        });
        
        assertTrue(exception.getMessage().contains("Không tìm thấy sản phẩm để xóa"));
        verify(productRepository).existsById(1L);
        verify(productRepository, never()).deleteById(anyLong());
    }
}

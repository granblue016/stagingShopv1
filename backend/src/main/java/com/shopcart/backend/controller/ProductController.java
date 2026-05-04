package com.shopcart.backend.controller;

import com.shopcart.backend.model.Product;
import com.shopcart.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
// Lưu ý: Đã gỡ bỏ @CrossOrigin ở đây vì chúng ta đã cấu hình tập trung tại SecurityConfig.java
public class ProductController {

    @Autowired
    private ProductService productService;

    // --- PHẦN DÀNH CHO USER (CUSTOMER) ---

    /**
     * Lấy toàn bộ danh sách sản phẩm
     * Endpoint: GET /api/products
     */
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Lấy chi tiết một sản phẩm theo ID
     * Endpoint: GET /api/products/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- PHẦN DÀNH CHO ADMIN (QUẢN TRỊ) ---

    /**
     * Thêm sản phẩm mới
     * Endpoint: POST /api/products
     */
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productService.createProduct(product);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    /**
     * Cập nhật thông tin sản phẩm (Giá, Tên, Mô tả...)
     * Endpoint: PUT /api/products/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    /**
     * Cập nhật số lượng tồn kho (Sử dụng logic ACID)
     * Endpoint: PATCH /api/products/{id}/stock
     */
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Product> updateStock(@PathVariable Long id, @RequestParam Integer quantity) {
        // Không cần try-catch ở đây vì GlobalExceptionHandler sẽ tự bắt RuntimeException
        Product updatedProduct = productService.updateStock(id, quantity);
        return ResponseEntity.ok(updatedProduct);
    }

    /**
     * Xóa sản phẩm khỏi hệ thống
     * Endpoint: DELETE /api/products/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
package com.shopcart.backend.controller;

import com.shopcart.backend.model.Coupon;
import com.shopcart.backend.model.Product;
import com.shopcart.backend.repository.CouponRepository;
import com.shopcart.backend.repository.OrderRepository;
import com.shopcart.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Tạo mã giảm giá mới - Chỉ ADMIN được truy cập
     */
    @PostMapping("/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCoupon(@RequestBody Map<String, Object> couponData) {
        try {
            Coupon coupon = Coupon.builder()
                    .code((String) couponData.get("code"))
                    .type((String) couponData.get("type"))
                    .value(Double.valueOf(couponData.get("value").toString()))
                    .expiryDate(LocalDateTime.parse((String) couponData.get("expiryDate")))
                    .active(true)
                    .build();

            Coupon savedCoupon = couponRepository.save(coupon);
            return ResponseEntity.ok(savedCoupon);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Cập nhật số lượng tồn kho - Chỉ ADMIN được truy cập
     */
    @PutMapping("/inventory/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateInventory(
            @PathVariable Long productId,
            @RequestBody Map<String, Object> inventoryData) {
        try {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

            Integer newStock = Integer.valueOf(inventoryData.get("stockQuantity").toString());
            product.setStockQuantity(newStock);

            Product updatedProduct = productRepository.save(product);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy tổng doanh thu từ các đơn hàng thành công - Chỉ ADMIN được truy cập
     */
    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTotalRevenue() {
        try {
            List<String> successfulStatuses = List.of("PAID", "SHIPPED", "DELIVERED");
            Double revenue = orderRepository.getTotalRevenue(successfulStatuses);

            Map<String, Object> response = new HashMap<>();
            response.put("revenue", revenue != null ? revenue : 0.0);
            response.put("currency", "VND");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy danh sách tất cả mã giảm giá - Chỉ ADMIN được truy cập
     */
    @GetMapping("/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllCoupons() {
        try {
            List<Coupon> coupons = couponRepository.findAll();
            return ResponseEntity.ok(coupons);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Xóa mã giảm giá - Chỉ ADMIN được truy cập
     */
    @DeleteMapping("/coupons/{couponId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long couponId) {
        try {
            if (!couponRepository.existsById(couponId)) {
                throw new RuntimeException("Mã giảm giá không tồn tại");
            }
            couponRepository.deleteById(couponId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đã xóa mã giảm giá thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

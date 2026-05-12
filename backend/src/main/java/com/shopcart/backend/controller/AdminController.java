package com.shopcart.backend.controller;

import com.shopcart.backend.model.Coupon;
import com.shopcart.backend.model.Product;
import com.shopcart.backend.model.Order;
import com.shopcart.backend.model.Review;
import com.shopcart.backend.repository.CouponRepository;
import com.shopcart.backend.repository.OrderRepository;
import com.shopcart.backend.repository.ProductRepository;
import com.shopcart.backend.repository.ReviewRepository;
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

    @Autowired
    private ReviewRepository reviewRepository;

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
                    .minSpend(couponData.get("minSpend") != null ? Double.valueOf(couponData.get("minSpend").toString()) : 0.0)
                    .maxDiscount(couponData.get("maxDiscount") != null ? Double.valueOf(couponData.get("maxDiscount").toString()) : null)
                    .usageLimit(couponData.get("usageLimit") != null ? Integer.valueOf(couponData.get("usageLimit").toString()) : null)
                    .usedCount(0)
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

    /**
     * Lấy danh sách tất cả đơn hàng - Chỉ ADMIN được truy cập
     */
    @GetMapping("/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrders() {
        try {
            List<Order> orders = orderRepository.findAll();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng - Chỉ ADMIN được truy cập
     */
    @PatchMapping("/orders/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> statusData) {
        try {
            String newStatus = statusData.get("status");
            
            // Validate status
            List<String> validStatuses = List.of("PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED");
            if (!validStatuses.contains(newStatus)) {
                throw new RuntimeException("Trạng thái không hợp lệ");
            }
            
            Order order = orderRepository.findById(Long.parseLong(orderId))
                    .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
            
            // Business logic validation
            String currentStatus = order.getStatus();
            
            // Cannot change status from CANCELLED or DELIVERED
            if ("CANCELLED".equals(currentStatus) || "DELIVERED".equals(currentStatus)) {
                throw new RuntimeException("Không thể thay đổi trạng thái của đơn hàng đã " + 
                    ("CANCELLED".equals(currentStatus) ? "bị hủy" : "giao thành công"));
            }
            
            // Only allow specific transitions
            if (!isValidTransition(currentStatus, newStatus)) {
                throw new RuntimeException("Chuyển trạng thái không hợp lệ từ " + currentStatus + " đến " + newStatus);
            }
            
            order.setStatus(newStatus);
            Order updatedOrder = orderRepository.save(order);
            
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    private boolean isValidTransition(String current, String next) {
        // Allow same status (no change)
        if (current.equals(next)) return true;
        
        // Define valid transitions
        return switch (current) {
            case "PENDING" -> "PAID".equals(next) || "CANCELLED".equals(next);
            case "PAID" -> "SHIPPED".equals(next) || "CANCELLED".equals(next);
            case "SHIPPED" -> "DELIVERED".equals(next);
            default -> false;
        };
    }

    /**
     * Lấy danh sách tất cả reviews - Chỉ ADMIN được truy cập
     */
    @GetMapping("/reviews")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllReviews() {
        try {
            List<Review> reviews = reviewRepository.findAll();
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

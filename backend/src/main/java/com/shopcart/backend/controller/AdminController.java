package com.shopcart.backend.controller;

import com.shopcart.backend.dto.InventoryUpdateRequest;
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
import java.util.ArrayList;
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
     * Test endpoint đơn giản
     */
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        try {
            System.out.println("DEBUG: Test endpoint called");
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Test endpoint works!");
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("DEBUG: Test endpoint error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Test endpoint cho JSON parsing
     */
    @PostMapping("/test-json")
    public ResponseEntity<?> testJsonParsing(@RequestBody InventoryUpdateRequest request) {
        try {
            System.out.println("DEBUG: Test JSON parsing called");
            System.out.println("DEBUG: Received stockQuantity: " + request.getStockQuantity());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "JSON parsing works!");
            response.put("receivedStockQuantity", request.getStockQuantity());
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("DEBUG: Test JSON parsing error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy AI analytics data cho admin
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAnalyticsData() {
        try {
            System.out.println("DEBUG: Getting analytics data for admin");
            
            // TODO: Lấy analytics data từ database hoặc cache
            // Hiện tại trả về mock data
            Map<String, Object> analytics = new HashMap<>();
            analytics.put("totalComments", 5);
            analytics.put("positiveSentiment", 2);
            analytics.put("neutralSentiment", 2);
            analytics.put("negativeSentiment", 1);
            analytics.put("averageRating", 3.2);
            analytics.put("recentComments", List.of(
                Map.of("id", 5, "content", "Test comment via POST /api/order-comments/3 with orderId in path", "sentiment", "Neutral"),
                Map.of("id", 4, "content", "Test comment via POST /api/order-comments with orderId in body", "sentiment", "Neutral"),
                Map.of("id", 3, "content", "Final test comment - direct API call", "sentiment", "Neutral")
            ));
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            System.out.println("DEBUG: Analytics error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Cập nhật số lượng tồn kho - Chỉ ADMIN được truy cập
     */
    @PutMapping("/inventory/{productId}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateInventory(
            @PathVariable Long productId,
            @RequestBody InventoryUpdateRequest request) {
        System.out.println("DEBUG: updateInventory method called!");
        System.out.println("DEBUG: productId = " + productId);
        System.out.println("DEBUG: request = " + request);
        try {
            System.out.println("DEBUG: Updating inventory for product " + productId);
            System.out.println("DEBUG: Received stock quantity: " + request.getStockQuantity());
            
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

            System.out.println("DEBUG: Current product stock: " + product.getStockQuantity());
            
            product.setStockQuantity(request.getStockQuantity());

            Product updatedProduct = productRepository.save(product);
            System.out.println("DEBUG: Updated product stock: " + updatedProduct.getStockQuantity());
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            System.out.println("DEBUG: Inventory update error: " + e.getMessage());
            e.printStackTrace();
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
            System.out.println("DEBUG: Found " + orders.size() + " orders");
            
            // Tạo response đơn giản để debug
            List<Map<String, Object>> formattedOrders = new ArrayList<>();
            for (Order order : orders) {
                try {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put("orderId", order.getOrderId().toString());
                    orderMap.put("totalAmount", order.getTotal());
                    orderMap.put("status", order.getStatus());
                    orderMap.put("customerEmail", "N/A");
                    orderMap.put("items", new ArrayList<>());
                    // Không dùng createdAt để tránh lỗi
                    formattedOrders.add(orderMap);
                } catch (Exception e) {
                    System.out.println("DEBUG: Error processing order " + order.getOrderId() + ": " + e.getMessage());
                    // Bỏ qua order này
                }
            }
            
            System.out.println("DEBUG: Successfully processed " + formattedOrders.size() + " orders");
            return ResponseEntity.ok(formattedOrders);
        } catch (Exception e) {
            System.out.println("DEBUG: getAllOrders error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng - Chỉ ADMIN được truy cập
     * Khi admin duyệt đơn (chuyển sang PAID), giá tiền sẽ được hiển thị đầy đủ
     */
    @PatchMapping("/orders/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> statusData) {
        try {
            String newStatus = statusData.get("status");
            
            // Validate status - Đồng bộ với frontend
            List<String> validStatuses = List.of("pending", "paid", "shipped", "delivered", "cancelled");
            if (!validStatuses.contains(newStatus.toLowerCase())) {
                throw new RuntimeException("Trạng thái không hợp lệ");
            }
            
            Order order = orderRepository.findById(Long.parseLong(orderId))
                    .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
            
            // Business logic validation
            String currentStatus = order.getStatus();
            
            // Cannot change status from CANCELLED or DELIVERED
            if ("cancelled".equals(currentStatus) || "delivered".equals(currentStatus)) {
                throw new RuntimeException("Không thể thay đổi trạng thái của đơn hàng đã " + 
                    ("cancelled".equals(currentStatus) ? "bị hủy" : "giao thành công"));
            }
            
            // Only allow specific transitions
            if (!isValidTransition(currentStatus, newStatus)) {
                throw new RuntimeException("Chuyển trạng thái không hợp lệ từ " + currentStatus + " đến " + newStatus);
            }
            
            // Khi admin duyệt đơn (chuyển từ pending -> paid), cho phép hiển thị giá tiền
            order.setStatus(newStatus);
            Order updatedOrder = orderRepository.save(order);
            
            // Thêm thông báo khi duyệt đơn thành công
            if ("paid".equals(newStatus) && "pending".equals(currentStatus)) {
                Map<String, Object> response = new HashMap<>();
                response.put("order", updatedOrder);
                response.put("message", "Đơn hàng đã được duyệt, giá tiền sẽ được hiển thị cho khách hàng");
                return ResponseEntity.ok(response);
            }
            
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
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
    
    /**
     * Validate order status transitions
     */
    private boolean isValidTransition(String currentStatus, String newStatus) {
        return switch (currentStatus) {
            case "pending" -> "paid".equals(newStatus) || "cancelled".equals(newStatus);
            case "paid" -> "shipped".equals(newStatus) || "cancelled".equals(newStatus);
            case "shipped" -> "delivered".equals(newStatus);
            default -> false;
        };
    }
}

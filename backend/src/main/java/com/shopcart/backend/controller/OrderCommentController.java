package com.shopcart.backend.controller;

import com.shopcart.backend.dto.OrderCommentRequest;
import com.shopcart.backend.model.Order;
import com.shopcart.backend.model.OrderComment;
import com.shopcart.backend.repository.OrderCommentRepository;
import com.shopcart.backend.repository.OrderRepository;
import com.shopcart.backend.service.NlpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/order-comments")
public class OrderCommentController {

    @Autowired
    private OrderCommentRepository orderCommentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private NlpService nlpService;

    /**
     * Thêm bình luận vào đơn hàng - Chỉ cho phép bình luận khi đơn hàng đã được thanh toán (paid, shipped, delivered)
     */
    @PostMapping("/{orderId}")
    public ResponseEntity<?> addComment(@PathVariable Long orderId, @RequestBody OrderCommentRequest request) {
        return addCommentInternal(orderId, request);
    }

    /**
     * Thêm bình luận vào đơn hàng - Lấy orderId từ request body
     */
    @PostMapping
    public ResponseEntity<?> addCommentWithOrderIdInBody(@RequestBody OrderCommentRequest request) {
        System.out.println("DEBUG: addCommentWithOrderIdInBody method called!");
        System.out.println("DEBUG: request = " + request);
        
        if (request.getOrderId() == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "orderId is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        return addCommentInternal(request.getOrderId(), request);
    }

    private ResponseEntity<?> addCommentInternal(Long orderId, OrderCommentRequest request) {
        System.out.println("DEBUG: addComment method called!");
        System.out.println("DEBUG: request = " + request);
        try {
            System.out.println("DEBUG: Adding comment to order " + orderId);
            System.out.println("DEBUG: Comment content: " + request.getContent());
            
            // Tạm thời mock UserID = 1
            Long currentUserId = 1L;

            // Kiểm tra đơn hàng tồn tại
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

            System.out.println("DEBUG: Order found with status: " + order.getStatus());
            
            // Kiểm tra đơn hàng đã được thanh toán chưa
            String status = order.getStatus();
            if (!"paid".equals(status) && !"shipped".equals(status) && !"delivered".equals(status)) {
                throw new RuntimeException("Chỉ có thể bình luận trên đơn hàng đã được thanh toán");
            }

            // Tạo bình luận mới
            OrderComment comment = OrderComment.builder()
                    .userId(currentUserId)
                    .content(request.getContent())
                    .order(order)
                    .build();

            OrderComment savedComment = orderCommentRepository.save(comment);
            System.out.println("DEBUG: Comment saved successfully");

            // Gửi bình luận đến AI analytics để phân tích
            try {
                System.out.println("DEBUG: Sending comment to AI analytics...");
                nlpService.analyzeSentimentWithUserRating(request.getContent(), null)
                    .subscribe(
                        nlpResponse -> {
                            System.out.println("DEBUG: AI analytics completed: " + nlpResponse);
                            // TODO: Lưu kết quả analytics vào database hoặc cache
                        },
                        error -> {
                            System.out.println("DEBUG: AI analytics failed: " + error.getMessage());
                        }
                    );
            } catch (Exception e) {
                System.out.println("DEBUG: Error sending to AI analytics: " + e.getMessage());
                // Không throw error vì comment đã được lưu thành công
            }

            Map<String, Object> response = new HashMap<>();
            response.put("comment", savedComment);
            response.put("message", "Bình luận đã được thêm thành công");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("DEBUG: Add comment error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy danh sách bình luận của một đơn hàng
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getCommentsByOrder(@PathVariable Long orderId) {
        System.out.println("DEBUG: getCommentsByOrder method called!");
        System.out.println("DEBUG: orderId = " + orderId);
        try {
            // Kiểm tra đơn hàng tồn tại
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

            System.out.println("DEBUG: Order found, getting comments...");
            List<OrderComment> comments = orderCommentRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
            System.out.println("DEBUG: Found " + comments.size() + " comments");

            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            System.out.println("DEBUG: Get comments error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Xóa bình luận - Chỉ admin được xóa
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        try {
            if (!orderCommentRepository.existsById(commentId)) {
                throw new RuntimeException("Bình luận không tồn tại");
            }
            orderCommentRepository.deleteById(commentId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Đã xóa bình luận thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

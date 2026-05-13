package com.shopcart.backend.service;

import com.shopcart.backend.dto.OrderRequest;
import com.shopcart.backend.model.*;
import com.shopcart.backend.repository.CouponRepository;
import com.shopcart.backend.repository.OrderRepository;
import com.shopcart.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CouponRepository couponRepository;

    /**
     * Luồng tạo đơn hàng an toàn (ACID)
     * Đảm bảo: Nếu một món hàng hết, toàn bộ quá trình sẽ bị hủy (Rollback)
     */
    @Transactional
    public Order createOrder(OrderRequest request, Long userId) {
        // 1. Xử lý mã giảm giá nếu có
        Double discountAmount = 0.0;
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            Coupon coupon = couponRepository.findByCodeAndActiveTrue(request.getCouponCode())
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không hợp lệ hoặc đã hết hạn"));

            // Kiểm tra hạn sử dụng
            if (coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Mã giảm giá đã hết hạn");
            }

            // Tính toán giảm giá
            if ("PERCENT".equals(coupon.getType())) {
                discountAmount = request.getSubtotal() * (coupon.getValue() / 100);
            } else if ("FIXED".equals(coupon.getType())) {
                discountAmount = coupon.getValue();
            }
        }

        // 2. Tạo đối tượng Order từ thông tin Frontend gửi về
        Order order = Order.builder()
                .userId(userId)
                .subtotal(request.getSubtotal())
                .discount(discountAmount)
                .shippingFee(request.getShippingFee())
                .total(request.getSubtotal() - discountAmount + request.getShippingFee())
                .shipping(request.getShipping()) // Thông tin người nhận
                .status("pending") // Trạng thái mặc định - sẽ được admin duyệt để hiển thị giá
                .build();

        // 2. Xử lý từng món hàng và trừ tồn kho
        List<OrderItem> orderItems = request.getCartItems().stream().map(itemDto -> {
            // Dùng findByIdForUpdate để KHÓA sản phẩm, đảm bảo ACID
            Product product = productRepository.findByIdForUpdate(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: ID " + itemDto.getProductId()));

            // Kiểm tra tồn kho
            if (product.getStockQuantity() < itemDto.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + product.getName() + " hiện không đủ hàng!");
            }

            // Trừ kho
            product.setStockQuantity(product.getStockQuantity() - itemDto.getQuantity());
            productRepository.save(product);

            // Tạo OrderItem (Snapshot dữ liệu lúc mua)
            return OrderItem.builder()
                    .productId(product.getId())
                    .name(product.getName())
                    .price(product.getPrice())
                    .quantity(itemDto.getQuantity())
                    .imageUrl(product.getImageUrl())
                    .order(order) // Liên kết ngược lại với Order
                    .build();
        }).collect(Collectors.toList());

        order.setItems(orderItems);

        // 3. Lưu đơn hàng (Sẽ lưu cả OrderItems nhờ CascadeType.ALL)
        return orderRepository.save(order);
    }

    /**
     * Lấy lịch sử đơn hàng cho trang /orders của Lovable
     */
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
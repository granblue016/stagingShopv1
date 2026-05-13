package com.shopcart.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    // Bổ sung: ID người mua để hiện đúng đơn hàng trong trang "My Orders"
    private Long userId;

    // Bổ sung: Trạng thái đơn hàng (Lovable dùng cái này để hiện màu sắc Badge)
    // Các giá trị: "pending", "completed", "cancelled"
    private String status;

    private Double subtotal;
    private Double discount;
    private Double shippingFee;
    private Double total;

    @Embedded
    private ShippingInfo shipping;

    private LocalDateTime createdAt;

    // Giữ nguyên: Quan hệ với các món hàng trong đơn
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<OrderItem> items = new ArrayList<>();

    // Thêm: Quan hệ với bình luận của đơn hàng
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<OrderComment> comments = new ArrayList<>();

    // Tự động gán thời gian tạo khi lưu vào database
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "pending"; // Mặc định đơn mới là chờ xử lý
        }
    }
}
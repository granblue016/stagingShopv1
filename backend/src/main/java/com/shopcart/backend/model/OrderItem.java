package com.shopcart.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Khớp hoàn toàn với interface CartItem trong frontend (types.ts)
    private Long productId;
    private String name;
    private Double price;
    private Integer quantity;
    private Integer stockQuantity; // Lưu lại stockQuantity tại thời điểm mua hoặc để hiển thị lại
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnore // Ngăn chặn vòng lặp vô hạn khi chuyển đổi sang JSON
    @ToString.Exclude // Ngăn lỗi đệ quy khi in log (quan trọng khi dùng Lombok @Data)
    @EqualsAndHashCode.Exclude // Ngăn lỗi đệ quy khi so sánh object
    private Order order;
}
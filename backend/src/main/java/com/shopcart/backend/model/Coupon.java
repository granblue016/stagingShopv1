package com.shopcart.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    // Loại giảm giá: PERCENT (%) hoặc FIXED (tiền mặt)
    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private Double value;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    // Giới hạn chi tiêu tối thiểu để áp dụng coupon
    @Column
    @Builder.Default
    private Double minSpend = 0.0;

    // Giảm giá tối đa cho một đơn hàng (chỉ áp dụng cho PERCENT type)
    @Column
    private Double maxDiscount;

    // Số lần sử dụng tối đa của coupon
    @Column
    private Integer usageLimit;

    // Số lần đã sử dụng coupon
    @Column
    @Builder.Default
    private Integer usedCount = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

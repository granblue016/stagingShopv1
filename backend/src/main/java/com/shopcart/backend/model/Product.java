package com.shopcart.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Double price;

    // Đổi tên thành imageUrl để khớp với lỗi ở dòng 40
    private String imageUrl;

    // Đổi tên thành stockQuantity để khớp với lỗi ở dòng 44 và 59
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    private String category;
}
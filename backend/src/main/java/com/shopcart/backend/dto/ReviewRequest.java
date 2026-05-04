package com.shopcart.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class ReviewRequest {
    @NotNull
    private Long productId;

    @NotBlank
    @Size(min = 10, message = "Review phải dài ít nhất 10 ký tự để AI phân tích chính xác")
    private String content;

    @Min(1) @Max(5)
    private Integer rating;
}
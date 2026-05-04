package com.shopcart.backend.dto;

import com.shopcart.backend.model.ShippingInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {

    // Danh sách các món hàng trong giỏ (Dùng để trừ kho và tạo OrderItem)
    private List<CartItemDTO> cartItems;

    // Các thông tin tính toán từ Frontend
    private Double subtotal;
    private Double discount;
    private Double shippingFee;
    private Double total;

    // Thông tin người nhận hàng (Nhúng trực tiếp từ Model ShippingInfo)
    private ShippingInfo shipping;

    /**
     * Lớp lồng (Inner Class) để định nghĩa cấu trúc tối giản của một món hàng
     * được gửi từ Frontend.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemDTO {
        private Long productId;
        private Integer quantity;
    }
}
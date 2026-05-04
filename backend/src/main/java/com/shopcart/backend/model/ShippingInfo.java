package com.shopcart.backend.model;

import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingInfo {
    private String fullName;

    // Cải tiến: Thêm email vì các form Checkout của Lovable thường yêu cầu
    // để gửi thông tin xác nhận đơn hàng cho khách.
    private String email;

    private String address;
    private String city;
    private String postalCode;
    private String phone;
}
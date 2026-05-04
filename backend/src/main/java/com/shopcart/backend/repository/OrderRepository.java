package com.shopcart.backend.repository;

import com.shopcart.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    // KIỂM TRA MUA HÀNG THỰC TẾ (Verified Purchase)
    // Phương thức này kiểm tra xem user đã có đơn hàng chứa sản phẩm này
    // và trạng thái đơn hàng nằm trong danh sách cho phép (PAID, SHIPPED, DELIVERED) hay chưa.
    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.items i " +
            "WHERE o.userId = :userId " +
            "AND i.productId = :productId " +
            "AND o.status IN :statuses")
    boolean existsVerifiedPurchase(@Param("userId") Long userId,
                                   @Param("productId") Long productId,
                                   @Param("statuses") List<String> statuses);
}
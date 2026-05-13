package com.shopcart.backend.repository;

import com.shopcart.backend.model.OrderComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderCommentRepository extends JpaRepository<OrderComment, Long> {
    
    @Query("SELECT oc FROM OrderComment oc WHERE oc.order.orderId = :orderId ORDER BY oc.createdAt ASC")
    List<OrderComment> findByOrderIdOrderByCreatedAtAsc(@Param("orderId") Long orderId);
}

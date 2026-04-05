package com.sandhya.fashion.repository;

import com.sandhya.fashion.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUserId(String userId);
    List<Order> findByAdminIdAndUserId(String adminId, String userId);
    List<Order> findByAdminIdAndStatus(String adminId, String status);
    List<Order> findByAdminIdAndOrderType(String adminId, String orderType);
    List<Order> findByAdminId(String adminId);
    
    @Query("{ 'adminId': ?0, 'orderDate': { $gte: ?1, $lte: ?2 } }")
    List<Order> findByAdminIdAndOrderDateBetween(String adminId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("{ 'adminId': ?0, 'status': ?1, 'orderDate': { $gte: ?2, $lte: ?3 } }")
    List<Order> findByAdminIdAndStatusAndOrderDateBetween(String adminId, String status, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query(value = "{ 'adminId': ?0, 'orderDate': { $gte: ?1, $lte: ?2 } }", count = true)
    long countByAdminIdAndOrderDateBetween(String adminId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query(value = "{ 'adminId': ?0, 'status': 'DELIVERED', 'orderDate': { $gte: ?1, $lte: ?2 } }", count = true)
    long countDeliveredOrdersByAdminIdAndBetween(String adminId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query(value = "{ 'adminId': ?0 }", count = true)
    long countByAdminId(String adminId);
}

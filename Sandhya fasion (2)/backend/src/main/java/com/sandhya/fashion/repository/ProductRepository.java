package com.sandhya.fashion.repository;

import com.sandhya.fashion.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByAdminId(String adminId);
    List<Product> findByAdminIdAndIsActive(String adminId, boolean isActive);
    List<Product> findByAdminIdAndCategoryAndIsActive(String adminId, String category, boolean isActive);
    
    @Query("{ 'adminId': ?0, 'sizes': { $in: ?1 }, 'isActive': true }")
    List<Product> findByAdminIdAndSizesIn(String adminId, List<String> sizes);
    
    @Query("{ 'adminId': ?0, 'category': ?1, 'sizes': { $in: ?2 }, 'isActive': true }")
    List<Product> findByAdminIdAndCategoryAndSizesIn(String adminId, String category, List<String> sizes);
    
    @Query("{ 'adminId': ?0, 'stockQuantity': { $lt: 20 }, 'isActive': true }")
    List<Product> findLowStockItemsByAdminId(String adminId);
}

package com.sandhya.fashion.repository;

import com.sandhya.fashion.model.Shop;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShopRepository extends MongoRepository<Shop, String> {
    Optional<Shop> findByOwnerId(String ownerId);
}

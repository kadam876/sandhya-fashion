package com.sandhya.fashion.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.sandhya.fashion.repository")
public class MongoConfig {
    // Relying on Spring Boot's auto-configuration for Atlas connection
    // through application.properties (spring.data.mongodb.uri)
}

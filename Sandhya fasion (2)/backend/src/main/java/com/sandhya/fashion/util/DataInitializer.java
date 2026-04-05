package com.sandhya.fashion.util;

import com.mongodb.MongoException;
import com.sandhya.fashion.model.Product;
import com.sandhya.fashion.model.User;
import com.sandhya.fashion.repository.ProductRepository;
import com.sandhya.fashion.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Starting data initialization...");
        
        try {
            // First test database connectivity
            if (!isDatabaseReachable()) {
                logger.error("Database is not reachable. Please check network/firewall settings.");
                return;
            }
            
            // Add delay to ensure MongoDB connection is established
            Thread.sleep(3000);
            
            initializeUsers();
            initializeProducts();
            logger.info("Data initialization completed successfully!");
        } catch (DataAccessException e) {
            logger.error("MongoDB connection error during data initialization: {}", e.getMessage());
            logger.warn("Continuing without data seeding. Please check your MongoDB connection.");
        } catch (Exception e) {
            logger.error("Error during data initialization: {}", e.getMessage());
        }
    }

    private boolean isDatabaseReachable() {
        try {
            // Simple ping command to test connectivity
            mongoTemplate.executeCommand("{ ping: 1 }");
            logger.info("Database connectivity test: SUCCESS");
            return true;
        } catch (MongoException e) {
            logger.error("Database connectivity test FAILED: {}", e.getMessage());
            if (e.getMessage().contains("internal_error") || e.getMessage().contains("SSL")) {
                logger.error("SSL/Network Issue Detected - Check:");
                logger.error("1. Atlas cluster accessibility (whitelist IP)");
                logger.error("2. Firewall blocking outbound connections");
                logger.error("3. Java 25 SSL compatibility issues");
                logger.error("4. DNS resolution problems");
            }
            return false;
        } catch (Exception e) {
            logger.error("Unexpected error during connectivity test: {}", e.getMessage());
            return false;
        }
    }

    private void initializeUsers() {
        try {
            // Migrate existing users (roles and passwords)
            List<User> allUsers = userRepository.findAll();
            boolean migrationPerformed = false;
            for (User user : allUsers) {
                boolean userChanged = false;
                
                // Migrate roles
                if ("ADMIN".equals(user.getRole())) {
                    user.setRole("SHOP_OWNER");
                    userChanged = true;
                } else if ("USER".equals(user.getRole())) {
                    user.setRole("CUSTOMER");
                    userChanged = true;
                }
                
                // Migrate passwords to BCrypt if they are plain text
                String pwd = user.getPassword();
                if (pwd != null && !pwd.startsWith("$2a$")) {
                    user.setPassword(passwordEncoder.encode(pwd));
                    userChanged = true;
                    logger.info("Migrating password to BCrypt for user: {}", user.getEmail());
                }
                
                if (userChanged) {
                    userRepository.save(user);
                    migrationPerformed = true;
                }
            }
            if (migrationPerformed) {
                logger.info("Database migration (roles/passwords) completed.");
            }

            Optional<User> adminOpt = userRepository.findByEmail("admin@sandhya.com");
            if (adminOpt.isEmpty()) {
                logger.info("Creating default shop owner user: admin@sandhya.com");
                User admin = new User();
                admin.setName("Admin User");
                admin.setEmail("admin@sandhya.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("SHOP_OWNER");
                admin.setVerified(true);
                admin.setActive(true);
                admin.setProfileComplete(true);
                userRepository.save(admin);
            } else {
                User adminUser = adminOpt.get();
                if ("admin123".equals(adminUser.getPassword())) {
                    adminUser.setPassword(passwordEncoder.encode("admin123"));
                    userRepository.save(adminUser);
                    logger.info("Fixed plain-text password for admin@sandhya.com");
                }
            }
        } catch (Exception e) {
            logger.error("Error initializing users: {}", e.getMessage());
            throw e;
        }
    }

    private void initializeProducts() {
        // Dummy product creation is disabled to ensure only shop owner data is shown.
        // productRepository.deleteAll(); // Run once to clear existing dummy data
        logger.info("Product initialization skipped (only live data intended).");
    }

    private Product createProduct(String name, String description, String category, Double price, Double wholesalePrice, Integer stockQuantity, String imageUrl, Double ratings, String badge, String badgeColor, List<String> sizes) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setCategory(category);
        product.setPrice(price);
        product.setWholesalePrice(wholesalePrice);
        product.setStockQuantity(stockQuantity);
        product.setImageUrl(imageUrl);
        product.setRatings(ratings);
        product.setBadge(badge);
        product.setBadgeColor(badgeColor);
        product.setSizes(sizes);
        product.setActive(true);
        return product;
    }
}

package com.sandhya.fashion.controller;

import com.sandhya.fashion.model.Product;
import com.sandhya.fashion.model.Product.ShopCatalogue;
import com.sandhya.fashion.model.Order;
import com.sandhya.fashion.model.User;
import com.sandhya.fashion.service.ProductService;
import com.sandhya.fashion.service.OrderService;
import com.sandhya.fashion.service.AnalyticsService;
import com.sandhya.fashion.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"})
public class AdminController {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private UserService userService;

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/catalogues")
    @PreAuthorize("hasAnyRole('OWNER', 'SHOP_OWNER')")
    public ResponseEntity<List<ShopCatalogue>> listCatalogues(@AuthenticationPrincipal User admin) {
        Query q = new Query(Criteria.where("adminId").is(admin.getId()))
                .with(Sort.by(Sort.Direction.ASC, "categoryName"));
        return ResponseEntity.ok(mongoTemplate.find(q, Product.ShopCatalogue.class));
    }

    @PostMapping("/catalogues")
    @PreAuthorize("hasAnyRole('OWNER', 'SHOP_OWNER')")
    public ResponseEntity<ShopCatalogue> createCatalogue(@AuthenticationPrincipal User admin, @RequestBody ShopCatalogue catalogue) {
        try {
            if (catalogue.getCategoryName() == null || catalogue.getCategoryName().isBlank()) {
                return ResponseEntity.badRequest().build();
            }
            if (catalogue.getSizes() == null || catalogue.getSizes().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            catalogue.setId(null);
            catalogue.setAdminId(admin.getId());
            catalogue.setCategoryName(catalogue.getCategoryName().trim());
            if (catalogue.getImageUrl() != null) {
                String img = catalogue.getImageUrl().trim();
                catalogue.setImageUrl(img.isEmpty() ? null : img);
            }
            return ResponseEntity.ok(mongoTemplate.save(catalogue));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/catalogues/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'SHOP_OWNER')")
    public ResponseEntity<Void> deleteCatalogue(@AuthenticationPrincipal User admin, @PathVariable String id) {
        ShopCatalogue existing = mongoTemplate.findById(id, Product.ShopCatalogue.class);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (!admin.getId().equals(existing.getAdminId())) {
            return ResponseEntity.status(403).build();
        }
        mongoTemplate.remove(existing);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/info")
    @PreAuthorize("hasAnyRole('OWNER', 'SHOP_OWNER')")
    public ResponseEntity<Map<String, Object>> getAdminInfo() {
        Map<String, Object> adminInfo = new HashMap<>();
        adminInfo.put("message", "Welcome to Admin Panel");
        adminInfo.put("adminName", "Admin User");
        adminInfo.put("permissions", List.of(
            "MANAGE_PRODUCTS",
            "MANAGE_ORDERS", 
            "VIEW_ANALYTICS",
            "MANAGE_USERS"
        ));
        adminInfo.put("dashboard", "/api/admin/dashboard");
        adminInfo.put("inventory", "/api/admin/inventory");
        adminInfo.put("orders", "/api/admin/orders");
        adminInfo.put("users", "/api/admin/my-users");
        return ResponseEntity.ok(adminInfo);
    }

    @GetMapping("/my-users")
    @PreAuthorize("hasAnyRole('OWNER', 'SHOP_OWNER')")
    public ResponseEntity<List<Map<String, Object>>> getMyUsers(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(userService.buildMyShopCustomers(admin.getId()));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('OWNER', 'SHOP_OWNER')")
    public ResponseEntity<Map<String, Object>> getDashboard(@AuthenticationPrincipal User admin) {
        Map<String, Object> dashboard = analyticsService.getDashboardStats(admin.getId());
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/inventory")
    @PreAuthorize("hasAnyRole('OWNER', 'SHOP_OWNER')")
    public ResponseEntity<List<Product>> getInventory(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(productService.getProductsByAdmin(admin.getId()));
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('OWNER', 'SHOP_OWNER')")
    public ResponseEntity<List<Order>> getAllOrders(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(orderService.getOrdersByAdmin(admin.getId()));
    }

    @PutMapping("/orders/{id}/status")
    @PreAuthorize("hasAnyRole('OWNER', 'SHOP_OWNER')")
    public ResponseEntity<Order> updateOrderStatus(
            @AuthenticationPrincipal User admin,
            @PathVariable String id,
            @RequestBody Map<String, String> statusRequest) {
        try {
            String status = statusRequest.get("status");
            Order updatedOrder = orderService.updateOrderStatusForShopOwner(id, status, admin.getId());
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/products")
    @PreAuthorize("hasAnyRole('OWNER', 'SHOP_OWNER')")
    public ResponseEntity<Product> createProduct(@AuthenticationPrincipal User admin, @RequestBody Product product) {
        try {
            product.setAdminId(admin.getId());
            Product savedProduct = productService.saveProduct(product);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/products/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'SHOP_OWNER')")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        try {
            Product updatedProduct = productService.updateProduct(id, product);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'SHOP_OWNER')")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- OWNER ONLY Endpoints ---

    @GetMapping("/shops")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<Map<String, Object>>> getAllShops() {
        return ResponseEntity.ok(userService.findAllShops());
    }

    @PostMapping("/shops/{id}/verify")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<User> verifyShop(@PathVariable String id, @RequestParam boolean status) {
        return ResponseEntity.ok(userService.updateVerificationStatus(id, status));
    }

    @GetMapping("/platform-stats")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Map<String, Object>> getPlatformStats() {
        return ResponseEntity.ok(analyticsService.getPlatformWideStats());
    }

    @GetMapping("/analytics/top-products")
    public ResponseEntity<List<Map<String, Object>>> getTopProducts(
            @AuthenticationPrincipal User admin,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.getTopSellingProducts(admin.getId(), limit));
    }

    @GetMapping("/analytics/predictions")
    public ResponseEntity<List<Map<String, Object>>> getPredictions(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(analyticsService.getSalesPredictions(admin.getId()));
    }

    @GetMapping("/analytics/sales")
    public ResponseEntity<Map<String, Object>> getSalesData(@AuthenticationPrincipal User admin, @RequestParam(defaultValue = "month") String period) {
        return ResponseEntity.ok(analyticsService.getSalesData(admin.getId(), period));
    }

    @GetMapping("/analytics/categories")
    public ResponseEntity<Map<String, Object>> getCategoryDistribution(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(analyticsService.getCategoryDistribution(admin.getId()));
    }

    @GetMapping("/analytics/order-status")
    public ResponseEntity<Map<String, Object>> getOrderStatusDistribution(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(analyticsService.getOrderStatusDistribution(admin.getId()));
    }
}

package com.sandhya.fashion.controller;

import com.sandhya.fashion.service.AnalyticsService;
import com.sandhya.fashion.model.User;
import com.sandhya.fashion.model.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"})
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(analyticsService.getDashboardStats(admin.getId()));
    }

    @GetMapping("/sales")
    public ResponseEntity<Map<String, Object>> getSalesData(@AuthenticationPrincipal User admin, @RequestParam(defaultValue = "month") String period) {
        return ResponseEntity.ok(analyticsService.getSalesData(admin.getId(), period));
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategoryDistribution(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(analyticsService.getCategoryDistribution(admin.getId()));
    }

    @GetMapping("/growth")
    public ResponseEntity<Map<String, Object>> getGrowthRates(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(analyticsService.getGrowthRates(admin.getId()));
    }

    @GetMapping("/order-status")
    public ResponseEntity<Map<String, Object>> getOrderStatusDistribution(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(analyticsService.getOrderStatusDistribution(admin.getId()));
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<Map<String, Object>>> getTopProducts(
            @AuthenticationPrincipal User admin,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.getTopSellingProducts(admin.getId(), limit));
    }

    @GetMapping("/predictions")
    public ResponseEntity<List<Map<String, Object>>> getPredictions(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(analyticsService.getSalesPredictions(admin.getId()));
    }
}

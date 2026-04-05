package com.sandhya.fashion.controller;

import com.sandhya.fashion.model.Order;
import com.sandhya.fashion.model.User;
import com.sandhya.fashion.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"})
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(orderService.getOrdersByUserId(userEmail));
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderRequest, Authentication authentication) {
        try {
            String userId = authentication.getName();
            List<Order.OrderItem> items = parseOrderItems(orderRequest.get("items"));
            String orderType = orderRequest.get("orderType") != null
                    ? String.valueOf(orderRequest.get("orderType")).trim()
                    : null;
            String shippingAddress = orderRequest.get("shippingAddress") != null
                    ? String.valueOf(orderRequest.get("shippingAddress")).trim()
                    : null;
            String paymentMethod = orderRequest.get("paymentMethod") != null
                    ? String.valueOf(orderRequest.get("paymentMethod")).trim()
                    : null;

            Order order = orderService.createOrder(userId, items, orderType, shippingAddress, paymentMethod);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Invalid order"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Could not place order"));
        }
    }

    @SuppressWarnings("unchecked")
    private List<Order.OrderItem> parseOrderItems(Object raw) {
        if (!(raw instanceof List<?> list)) {
            throw new RuntimeException("items is required and must be an array");
        }
        List<Order.OrderItem> out = new ArrayList<>();
        for (Object el : list) {
            if (!(el instanceof Map)) {
                continue;
            }
            Map<String, Object> m = (Map<String, Object>) el;
            String productId = stringOrNull(m.get("productId"));
            if (productId == null || productId.isEmpty()) {
                throw new RuntimeException("Each item must have productId");
            }
            int quantity = toPositiveInt(m.get("quantity"));
            Order.OrderItem item = new Order.OrderItem();
            item.setProductId(productId);
            item.setQuantity(quantity);
            Object sel = m.get("selectedSize");
            item.setSelectedSize(sel != null ? String.valueOf(sel).trim() : null);
            out.add(item);
        }
        return out;
    }

    private static String stringOrNull(Object v) {
        if (v == null) {
            return null;
        }
        String s = String.valueOf(v).trim();
        return s.isEmpty() ? null : s;
    }

    private static int toPositiveInt(Object v) {
        if (v == null) {
            throw new RuntimeException("quantity is required for each item");
        }
        int n;
        if (v instanceof Number num) {
            n = num.intValue();
        } else {
            n = Integer.parseInt(String.valueOf(v).trim());
        }
        if (n < 1) {
            throw new RuntimeException("quantity must be at least 1");
        }
        return n;
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable String id, @RequestBody Map<String, String> statusRequest) {
        try {
            String status = statusRequest.get("status");
            Order updatedOrder = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@AuthenticationPrincipal User admin, @PathVariable String status) {
        return ResponseEntity.ok(orderService.getOrdersByAdminAndStatus(admin.getId(), status));
    }
}

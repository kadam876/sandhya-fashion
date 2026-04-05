package com.sandhya.fashion.service;

import com.sandhya.fashion.model.Order;
import com.sandhya.fashion.model.Product;
import com.sandhya.fashion.model.User;
import com.sandhya.fashion.repository.OrderRepository;
import com.sandhya.fashion.repository.ProductRepository;
import com.sandhya.fashion.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByAdmin(String adminId) {
        return orderRepository.findByAdminId(adminId);
    }

    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByUserId(String userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getOrdersByAdminAndStatus(String adminId, String status) {
        return orderRepository.findByAdminIdAndStatus(adminId, status);
    }

    public Order createOrder(String userId, List<Order.OrderItem> items, String orderType, String shippingAddress, String paymentMethod) {
        if (items == null || items.isEmpty()) {
            throw new RuntimeException("Order must contain at least one item");
        }
        if (shippingAddress == null || shippingAddress.isBlank()) {
            throw new RuntimeException("Shipping address is required");
        }
        if (orderType == null || orderType.isBlank()) {
            orderType = "RETAIL";
        }
        String pay = (paymentMethod != null && !paymentMethod.isBlank()) ? paymentMethod.trim() : "COD";

        double totalAmount = 0.0;
        double savings = 0.0;

        String adminId = null;
        for (Order.OrderItem item : items) {
            Optional<Product> productOpt = productRepository.findById(item.getProductId());
            if (productOpt.isEmpty()) {
                throw new RuntimeException("Product not found: " + item.getProductId());
            }

            Product product = productOpt.get();
            String productOwnerId = product.getAdminId();

            if (adminId == null) {
                adminId = productOwnerId;
            } else if (productOwnerId != null && !Objects.equals(adminId, productOwnerId)) {
                throw new RuntimeException("Cart contains products from different shops. Place one order per shop.");
            }

            if (product.getStockQuantity() == null || product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            double unitPrice = product.getPriceForOrderType(orderType);
            double originalPrice = product.getPrice() != null ? product.getPrice() : unitPrice;

            item.setUnitPrice(unitPrice);
            item.setTotalPrice(unitPrice * item.getQuantity());
            item.setProductName(product.getName());
            item.setProductImage(product.getImageUrl());

            totalAmount += item.getTotalPrice();
            savings += (originalPrice - unitPrice) * item.getQuantity();

            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setAdminId(adminId);
        order.setItems(items);
        order.setTotalAmount(totalAmount);
        order.setSavings(savings);
        order.setOrderType(orderType);
        order.setStatus("PENDING_CONFIRMATION");
        order.setOrderDate(java.time.LocalDateTime.now());
        order.setShippingAddress(shippingAddress.trim());
        order.setPaymentMethod(pay);

        Order saved = orderRepository.save(order);
        linkCustomerToShopIfUnassigned(userId, adminId);
        return saved;
    }

    private void linkCustomerToShopIfUnassigned(String customerEmail, String shopAdminId) {
        if (customerEmail == null || shopAdminId == null) {
            return;
        }
        Optional<User> opt = userRepository.findByEmail(customerEmail);
        if (opt.isEmpty()) {
            return;
        }
        User u = opt.get();
        if (!"CUSTOMER".equalsIgnoreCase(u.getRole())) {
            return;
        }
        if (u.getAdminId() == null || u.getAdminId().isBlank()) {
            u.setAdminId(shopAdminId);
            userRepository.save(u);
        }
    }

    public Order updateOrderStatus(String orderId, String status) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(status);

            if ("DELIVERED".equals(status)) {
                order.setDeliveryDate(LocalDateTime.now());
            }

            return orderRepository.save(order);
        }
        throw new RuntimeException("Order not found with id: " + orderId);
    }

    public Order updateOrderStatusForShopOwner(String orderId, String status, String shopOwnerId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            throw new RuntimeException("Order not found with id: " + orderId);
        }
        Order order = orderOpt.get();
        if (order.getAdminId() == null || !order.getAdminId().equals(shopOwnerId)) {
            throw new RuntimeException("Order not found");
        }
        order.setStatus(status);
        if ("DELIVERED".equals(status)) {
            order.setDeliveryDate(LocalDateTime.now());
        }
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByAdminAndDateRange(String adminId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByAdminIdAndOrderDateBetween(adminId, startDate, endDate);
    }

    public List<Order> getOrdersByAdminAndStatusAndDateRange(String adminId, String status, LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByAdminIdAndStatusAndOrderDateBetween(adminId, status, startDate, endDate);
    }

    public long getTotalOrdersCount(String adminId) {
        return orderRepository.countByAdminId(adminId);
    }

    public long getOrdersCountByAdminAndDateRange(String adminId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.countByAdminIdAndOrderDateBetween(adminId, startDate, endDate);
    }

    public long getDeliveredOrdersCountByAdminAndDateRange(String adminId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.countDeliveredOrdersByAdminIdAndBetween(adminId, startDate, endDate);
    }
}

package com.sandhya.fashion.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "orders")
public class Order {
    
    @Id
    private String id;
    private String userId;
    private List<OrderItem> items;
    private Double totalAmount;
    private Double savings;
    private String orderType; // RETAIL or WHOLESALE
    private String status; // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;
    private String shippingAddress;
    private String paymentMethod;
    private String trackingNumber;
    private String adminId; // Target shop owner
    
    // Default constructor
    public Order() {}
    
    // All-args constructor
    public Order(String id, String userId, List<OrderItem> items, Double totalAmount, Double savings, String orderType, String status, LocalDateTime orderDate, LocalDateTime deliveryDate, String shippingAddress, String paymentMethod, String trackingNumber, String adminId) {
        this.id = id;
        this.userId = userId;
        this.items = items;
        this.totalAmount = totalAmount;
        this.savings = savings;
        this.orderType = orderType;
        this.status = status;
        this.orderDate = orderDate;
        this.deliveryDate = deliveryDate;
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.trackingNumber = trackingNumber;
        this.adminId = adminId;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    
    public Double getSavings() { return savings; }
    public void setSavings(Double savings) { this.savings = savings; }
    
    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
    
    public LocalDateTime getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDateTime deliveryDate) { this.deliveryDate = deliveryDate; }
    
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    
    public String getAdminId() { return adminId; }
    public void setAdminId(String adminId) { this.adminId = adminId; }
    
    public static class OrderItem {
        private String productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private Double unitPrice;
        private Double totalPrice;
        private String selectedSize;
        
        // Default constructor
        public OrderItem() {}
        
        // All-args constructor
        public OrderItem(String productId, String productName, String productImage, Integer quantity, Double unitPrice, Double totalPrice, String selectedSize) {
            this.productId = productId;
            this.productName = productName;
            this.productImage = productImage;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
            this.totalPrice = totalPrice;
            this.selectedSize = selectedSize;
        }
        
        // Getters and Setters
        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        
        public String getProductImage() { return productImage; }
        public void setProductImage(String productImage) { this.productImage = productImage; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        
        public Double getUnitPrice() { return unitPrice; }
        public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }
        
        public Double getTotalPrice() { return totalPrice; }
        public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
        
        public String getSelectedSize() { return selectedSize; }
        public void setSelectedSize(String selectedSize) { this.selectedSize = selectedSize; }
    }
}

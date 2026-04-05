package com.sandhya.fashion.dto;

import com.sandhya.fashion.model.Order;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    private List<Order.OrderItem> items;
    private String orderType; // RETAIL or WHOLESALE
    private String shippingAddress;
    private String paymentMethod;
}

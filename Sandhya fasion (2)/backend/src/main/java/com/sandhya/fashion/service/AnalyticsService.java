package com.sandhya.fashion.service;

import com.sandhya.fashion.model.Order;
import com.sandhya.fashion.model.Product;
import com.sandhya.fashion.repository.OrderRepository;
import com.sandhya.fashion.repository.ProductRepository;
import com.sandhya.fashion.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;


@Service
public class AnalyticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getDashboardStats(String adminId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Total products
        long totalProducts = productRepository.findByAdminIdAndIsActive(adminId, true).size();
        stats.put("totalProducts", totalProducts);
        
        // Low stock items
        long lowStockItems = productRepository.findLowStockItemsByAdminId(adminId).size();
        stats.put("lowStockItems", lowStockItems);
        
        // Total inventory value
        List<Product> allProducts = productRepository.findByAdminIdAndIsActive(adminId, true);
        double totalInventoryValue = allProducts.stream()
                .mapToDouble(p -> p.getPrice() * p.getStockQuantity())
                .sum();
        stats.put("totalInventoryValue", totalInventoryValue);
        
        // Total orders
        long totalOrders = orderRepository.countByAdminId(adminId);
        stats.put("totalOrders", totalOrders);
        
        // Recent orders (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Order> recentOrders = orderRepository.findByAdminIdAndOrderDateBetween(adminId, thirtyDaysAgo, LocalDateTime.now());
        stats.put("recentOrders", recentOrders.size());
        
        // Total revenue (last 30 days) - Include all valid processed orders
        double totalRevenue = recentOrders.stream()
                .filter(order -> order.getStatus() != null && 
                       (order.getStatus().equalsIgnoreCase("PENDING") || 
                        order.getStatus().equalsIgnoreCase("CONFIRMED") || 
                        order.getStatus().equalsIgnoreCase("SHIPPED") || 
                        order.getStatus().equalsIgnoreCase("DELIVERED")))
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount() : 0.0)
                .sum();
        stats.put("totalRevenue", totalRevenue);


        
        return stats;
    }

    public Map<String, Object> getSalesData(String adminId, String period) {
        LocalDateTime startDate;
        LocalDateTime endDate = LocalDateTime.now();
        
        switch (period.toLowerCase()) {
            case "week":
                startDate = endDate.minusWeeks(1);
                break;
            case "month":
                startDate = endDate.minusMonths(1);
                break;
            case "year":
                startDate = endDate.minusYears(1);
                break;
            default:
                startDate = endDate.minusMonths(1);
        }
        
        List<Order> orders = orderRepository.findByAdminIdAndOrderDateBetween(adminId, startDate, endDate);
        
        Map<String, Object> salesData = new HashMap<>();
        List<Map<String, Object>> salesByDate = new ArrayList<>();
        
        // Group by date
        Map<String, List<Order>> ordersByDate = orders.stream()
                .collect(Collectors.groupingBy(order -> 
                    order.getOrderDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))));
        
        for (String date : ordersByDate.keySet()) {
            List<Order> dayOrders = ordersByDate.get(date);
            double daySales = dayOrders.stream()
                    .filter(order -> order.getStatus() != null && 
                           (order.getStatus().equalsIgnoreCase("PENDING") || 
                            order.getStatus().equalsIgnoreCase("CONFIRMED") || 
                            order.getStatus().equalsIgnoreCase("SHIPPED") || 
                            order.getStatus().equalsIgnoreCase("DELIVERED")))
                    .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount() : 0.0)
                    .sum();



            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date);
            dayData.put("sales", daySales);
            dayData.put("orders", dayOrders.size());
            salesByDate.add(dayData);
        }
        
        // Sort by date
        salesByDate.sort((a, b) -> ((String) a.get("date")).compareTo((String) b.get("date")));
        
        salesData.put("salesByDate", salesByDate);
        salesData.put("totalSales", salesByDate.stream().mapToDouble(d -> (Double) d.get("sales")).sum());
        salesData.put("totalOrders", salesByDate.stream().mapToInt(d -> (Integer) d.get("orders")).sum());
        
        return salesData;
    }

    public Map<String, Object> getCategoryDistribution(String adminId) {
        List<Product> products = productRepository.findByAdminIdAndIsActive(adminId, true);
        
        Map<String, Long> categoryCounts = products.stream()
                .collect(Collectors.groupingBy(Product::getCategory, Collectors.counting()));
        
        List<Map<String, Object>> categoryData = new ArrayList<>();
        for (Map.Entry<String, Long> entry : categoryCounts.entrySet()) {
            Map<String, Object> category = new HashMap<>();
            category.put("category", entry.getKey());
            category.put("count", entry.getValue());
            categoryData.add(category);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("categories", categoryData);
        result.put("total", products.size());
        
        return result;
    }

    public Map<String, Object> getGrowthRates(String adminId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastMonthStart = now.minusMonths(1);
        LocalDateTime lastMonthEnd = now;
        LocalDateTime previousMonthStart = now.minusMonths(2);
        LocalDateTime previousMonthEnd = lastMonthStart;
        
        List<Order> lastMonthOrders = orderRepository.findByAdminIdAndOrderDateBetween(adminId, lastMonthStart, lastMonthEnd);
        List<Order> previousMonthOrders = orderRepository.findByAdminIdAndOrderDateBetween(adminId, previousMonthStart, previousMonthEnd);
        
        double lastMonthRevenue = lastMonthOrders.stream()
                .filter(order -> order.getStatus() != null && 
                       Arrays.asList("PENDING", "CONFIRMED", "SHIPPED", "DELIVERED").contains(order.getStatus().toUpperCase().trim()))
                .mapToDouble(Order::getTotalAmount)
                .sum();
        
        double previousMonthRevenue = previousMonthOrders.stream()
                .filter(order -> order.getStatus() != null && 
                       Arrays.asList("PENDING", "CONFIRMED", "SHIPPED", "DELIVERED").contains(order.getStatus().toUpperCase().trim()))
                .mapToDouble(Order::getTotalAmount)
                .sum();


        
        int lastMonthOrderCount = lastMonthOrders.size();
        int previousMonthOrderCount = previousMonthOrders.size();
        
        double revenueGrowth = previousMonthRevenue == 0 ? 0 : 
                ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
        
        double orderGrowth = previousMonthOrderCount == 0 ? 0 :
                ((double)(lastMonthOrderCount - previousMonthOrderCount) / previousMonthOrderCount) * 100;
        
        Map<String, Object> growthData = new HashMap<>();
        growthData.put("revenueGrowth", revenueGrowth);
        growthData.put("orderGrowth", orderGrowth);
        growthData.put("lastMonthRevenue", lastMonthRevenue);
        growthData.put("previousMonthRevenue", previousMonthRevenue);
        growthData.put("lastMonthOrders", lastMonthOrderCount);
        growthData.put("previousMonthOrders", previousMonthOrderCount);
        
        return growthData;
    }

    public Map<String, Object> getOrderStatusDistribution(String adminId) {
        List<Order> allOrders = orderRepository.findByAdminId(adminId);
        
        Map<String, Long> statusCounts = allOrders.stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));
        
        List<Map<String, Object>> statusData = new ArrayList<>();
        for (Map.Entry<String, Long> entry : statusCounts.entrySet()) {
            Map<String, Object> status = new HashMap<>();
            status.put("status", entry.getKey());
            status.put("count", entry.getValue());
            statusData.add(status);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("statusDistribution", statusData);
        result.put("total", allOrders.size());
        
        return result;
    }

    public List<Map<String, Object>> getTopSellingProducts(String adminId, int limit) {
        List<Order> allOrders = orderRepository.findByAdminId(adminId);
        List<Order> validOrders = allOrders.stream()
                .filter(order -> order.getStatus() != null && 
                       (order.getStatus().equalsIgnoreCase("PENDING") || 
                        order.getStatus().equalsIgnoreCase("CONFIRMED") || 
                        order.getStatus().equalsIgnoreCase("SHIPPED") || 
                        order.getStatus().equalsIgnoreCase("DELIVERED")))
                .collect(Collectors.toList());


                
        System.out.println("Analytics: Found " + validOrders.size() + " valid orders (CONFIRMED/SHIPPED/DELIVERED)");

        Map<String, Integer> productQuantities = new HashMap<>();
        Map<String, String> productNames = new HashMap<>();
        Map<String, String> productImages = new HashMap<>();

        for (Order order : validOrders) {
            if (order.getItems() != null) {
                System.out.println("Analytics: Processing order " + order.getId() + " with " + order.getItems().size() + " items");
                for (Order.OrderItem item : order.getItems()) {
                    if (item.getProductId() == null) {
                        System.out.println("Analytics: Warning - Item has null productId in order " + order.getId());
                        continue;
                    }
                    productQuantities.merge(item.getProductId(), item.getQuantity(), Integer::sum);
                    if (!productNames.containsKey(item.getProductId())) {
                        productNames.put(item.getProductId(), item.getProductName());
                        productImages.put(item.getProductId(), item.getProductImage());
                    }
                }
            } else {
                System.out.println("Analytics: Warning - Order " + order.getId() + " has no items");
            }
        }



        return productQuantities.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("productId", entry.getKey());
                    map.put("name", productNames.get(entry.getKey()));
                    map.put("image", productImages.get(entry.getKey()));
                    map.put("quantity", entry.getValue());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getSalesPredictions(String adminId) {
        Map<String, Object> pastSalesRaw = getSalesData(adminId, "month");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> pastSales = (List<Map<String, Object>>) pastSalesRaw.get("salesByDate");

        if (pastSales == null || pastSales.isEmpty()) return new ArrayList<>();

        // Linear Regression Calculation (y = mx + c)
        int n = pastSales.size();
        double sumX = 0;
        double sumY = 0;
        double sumXY = 0;
        double sumX2 = 0;

        for (int i = 0; i < n; i++) {
            double x = i + 1; // Day index (1 to n)
            Object s = pastSales.get(i).get("sales");
            double y = s instanceof Number ? ((Number) s).doubleValue() : 0.0;
            
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }

        // Calculate Slope (m) and Intercept (c) using Least Squares method
        double denominator = (n * sumX2) - (sumX * sumX);
        double m = (denominator == 0) ? 0 : (n * sumXY - sumX * sumY) / denominator;
        double c = (sumY - m * sumX) / n;

        List<Map<String, Object>> predictions = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        String lastDateStr = (String) pastSales.get(n - 1).get("date");
        LocalDateTime lastDate = LocalDateTime.parse(lastDateStr + "T00:00:00");

        // Project the next 7 days
        for (int i = 1; i <= 7; i++) {
            Map<String, Object> pred = new HashMap<>();
            double futureX = n + i;
            double predictedSales = (m * futureX) + c;
            
            // Ensure predicted sales don't fall below zero
            predictedSales = Math.max(0, predictedSales);
            
            pred.put("date", lastDate.plusDays(i).format(dtf));
            pred.put("sales", predictedSales);
            predictions.add(pred);
        }
        return predictions;
    }


    public Map<String, Object> getPlatformWideStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Total boutique partners
        long totalShops = userRepository.findAll().stream()
                .filter(u -> u.getShopName() != null && !u.getShopName().isEmpty())
                .count();
        stats.put("totalShops", totalShops);
        
        // Total customers
        long totalUsers = userRepository.findAll().stream()
                .filter(u -> u.getShopName() == null || u.getShopName().isEmpty())
                .count();
        stats.put("totalUsers", totalUsers);
        
        // Total orders across platform
        long totalOrders = orderRepository.count();
        stats.put("totalOrders", totalOrders);
        
        // Total platform revenue
        double totalRevenue = orderRepository.findAll().stream()
                .filter(order -> order.getStatus() != null && 
                       Arrays.asList("PENDING", "CONFIRMED", "SHIPPED", "DELIVERED").contains(order.getStatus().toUpperCase().trim()))
                .mapToDouble(Order::getTotalAmount)
                .sum();
        stats.put("totalRevenue", totalRevenue);

        
        // Mock growth for UI
        stats.put("platformGrowth", 15.4);
        
        return stats;
    }
}

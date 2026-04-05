package com.sandhya.fashion.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "products")
public class Product {
    
    @Id
    private String id;
    private String name;
    private String description;
    private String category;
    private Double price;
    private Double wholesalePrice;
    private Integer stockQuantity;
    private String imageUrl;
    private List<String> sizes;
    private Double ratings;
    private String badge;
    private String badgeColor;
    private String adminId; // Link to the shop owner
    /** When set, product belongs to this shop catalogue (see {@link ShopCatalogue}). */
    private String catalogueId;
    private boolean isActive;
    
    // Default constructor
    public Product() {}
    
    // All-args constructor
    public Product(String id, String name, String description, String category, Double price, Double wholesalePrice, Integer stockQuantity, String imageUrl, List<String> sizes, Double ratings, String badge, String badgeColor, boolean isActive, String adminId, String catalogueId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.price = price;
        this.wholesalePrice = wholesalePrice;
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.sizes = sizes;
        this.ratings = ratings;
        this.badge = badge;
        this.badgeColor = badgeColor;
        this.isActive = isActive;
        this.adminId = adminId;
        this.catalogueId = catalogueId;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    
    public Double getWholesalePrice() { return wholesalePrice; }
    public void setWholesalePrice(Double wholesalePrice) { this.wholesalePrice = wholesalePrice; }
    
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
    public List<String> getSizes() { return sizes; }
    public void setSizes(List<String> sizes) { this.sizes = sizes; }
    
    public Double getRatings() { return ratings; }
    public void setRatings(Double ratings) { this.ratings = ratings; }
    
    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }
    
    public String getBadgeColor() { return badgeColor; }
    public void setBadgeColor(String badgeColor) { this.badgeColor = badgeColor; }
    
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    
    public String getAdminId() { return adminId; }
    public void setAdminId(String adminId) { this.adminId = adminId; }

    public String getCatalogueId() { return catalogueId; }
    public void setCatalogueId(String catalogueId) { this.catalogueId = catalogueId; }
    
    public Double getPriceForOrderType(String orderType) {
        if ("WHOLESALE".equalsIgnoreCase(orderType)) {
            return wholesalePrice != null ? wholesalePrice : price;
        }
        return price;
    }

    /**
     * Shop catalogue entry (category name + sizes) for inventory; stored in {@code catalogues} collection.
     */
    @Document(collection = "catalogues")
    public static class ShopCatalogue {

        @Id
        private String id;
        private String adminId;
        private String categoryName;
        /** Optional cover image; if null, clients should use a default (e.g. Google gstatic placeholder). */
        private String imageUrl;
        private List<String> sizes;

        public ShopCatalogue() {
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getAdminId() {
            return adminId;
        }

        public void setAdminId(String adminId) {
            this.adminId = adminId;
        }

        public String getCategoryName() {
            return categoryName;
        }

        public void setCategoryName(String categoryName) {
            this.categoryName = categoryName;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public List<String> getSizes() {
            return sizes;
        }

        public void setSizes(List<String> sizes) {
            this.sizes = sizes;
        }
    }
}

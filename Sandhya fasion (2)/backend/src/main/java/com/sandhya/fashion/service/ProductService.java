package com.sandhya.fashion.service;

import com.sandhya.fashion.model.Product;
import com.sandhya.fashion.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<Product> getAllProducts() {
        return productRepository.findAll().stream()
                .filter(Product::isActive)
                .collect(Collectors.toList());
    }

    public List<Product> getProductsByAdmin(String adminId) {
        return productRepository.findByAdminIdAndIsActive(adminId, true);
    }

    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id).filter(Product::isActive);
    }

    public List<Product> getProductsByCategory(String category) {
        if ("All".equalsIgnoreCase(category)) {
            return getAllProducts();
        }
        return productRepository.findAll().stream()
                .filter(p -> p.isActive() && category.equalsIgnoreCase(p.getCategory()))
                .collect(Collectors.toList());
    }

    /**
     * Products for a shop catalogue: by {@link Product#getCatalogueId()}, or legacy match on category + adminId.
     */
    public List<Product> getProductsByCatalogueId(String catalogueId) {
        Product.ShopCatalogue cat = mongoTemplate.findById(catalogueId, Product.ShopCatalogue.class);
        if (cat == null) {
            return Collections.emptyList();
        }
        final String cid = cat.getId();
        final String catName = cat.getCategoryName();
        final String admin = cat.getAdminId();
        return productRepository.findAll().stream()
                .filter(Product::isActive)
                .filter(p -> cid.equals(p.getCatalogueId())
                        || (p.getCatalogueId() == null && admin != null && admin.equals(p.getAdminId())
                        && catName != null && p.getCategory() != null && catName.equalsIgnoreCase(p.getCategory())))
                .collect(Collectors.toList());
    }

    public List<Product.ShopCatalogue> getAllShopCatalogues() {
        Query q = new Query().with(Sort.by(Sort.Direction.ASC, "categoryName"));
        return mongoTemplate.find(q, Product.ShopCatalogue.class);
    }

    public List<Product> getProductsByAdminAndCategory(String adminId, String category) {
        if ("All".equalsIgnoreCase(category)) {
            return getProductsByAdmin(adminId);
        }
        return productRepository.findByAdminIdAndCategoryAndIsActive(adminId, category, true);
    }

    public List<Product> getProductsByAdminAndSizes(String adminId, List<String> sizes) {
        return productRepository.findByAdminIdAndSizesIn(adminId, sizes);
    }

    public List<Product> getProductsByCategoryAndSizes(String category, List<String> sizes) {
        if ("All".equalsIgnoreCase(category)) {
            return productRepository.findAll().stream()
                    .filter(p -> p.isActive() && p.getSizes() != null && p.getSizes().stream().anyMatch(sizes::contains))
                    .collect(Collectors.toList());
        }
        return productRepository.findAll().stream()
                .filter(p -> p.isActive() && category.equalsIgnoreCase(p.getCategory()) && p.getSizes() != null && p.getSizes().stream().anyMatch(sizes::contains))
                .collect(Collectors.toList());
    }

    public List<Product> getProductsByAdminAndCategoryAndSizes(String adminId, String category, List<String> sizes) {
        if ("All".equalsIgnoreCase(category)) {
            return getProductsByAdminAndSizes(adminId, sizes);
        }
        return productRepository.findByAdminIdAndCategoryAndSizesIn(adminId, category, sizes);
    }

    public List<String> getAllCategoriesByAdmin(String adminId) {
        List<Product> products = getProductsByAdmin(adminId);
        return products.stream()
                .map(Product::getCategory)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<String> getAllCategories() {
        List<Product> products = getAllProducts();
        return products.stream()
                .map(Product::getCategory)
                .distinct()
                .collect(Collectors.toList());
    }

    public Product saveProduct(Product product) {
        product.setActive(true);
        return productRepository.save(product);
    }

    public Product updateProduct(String id, Product productDetails) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setCategory(productDetails.getCategory());
            product.setPrice(productDetails.getPrice());
            product.setWholesalePrice(productDetails.getWholesalePrice());
            product.setStockQuantity(productDetails.getStockQuantity());
            product.setImageUrl(productDetails.getImageUrl());
            product.setSizes(productDetails.getSizes());
            product.setRatings(productDetails.getRatings());
            product.setBadge(productDetails.getBadge());
            product.setBadgeColor(productDetails.getBadgeColor());
            if (productDetails.getCatalogueId() != null) {
                product.setCatalogueId(productDetails.getCatalogueId());
            }
            return productRepository.save(product);
        }
        throw new RuntimeException("Product not found with id: " + id);
    }

    public void deleteProduct(String id) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();
            product.setActive(false);
            productRepository.save(product);
        } else {
            throw new RuntimeException("Product not found with id: " + id);
        }
    }

    public List<Product> getLowStockProducts(String adminId) {
        return productRepository.findLowStockItemsByAdminId(adminId);
    }

    public long getTotalProductsCount(String adminId) {
        return productRepository.findByAdminIdAndIsActive(adminId, true).size();
    }

    public long getLowStockCount(String adminId) {
        return productRepository.findLowStockItemsByAdminId(adminId).size();
    }

    public void deleteAllProducts() {
        productRepository.deleteAll();
    }
}

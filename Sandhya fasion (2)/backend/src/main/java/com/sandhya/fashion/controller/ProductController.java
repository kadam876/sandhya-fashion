package com.sandhya.fashion.controller;

import com.sandhya.fashion.model.Product;
import com.sandhya.fashion.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5175", "http://localhost:5174"})
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/catalogue/{catalogueId}")
    public ResponseEntity<List<Product>> getProductsByCatalogue(@PathVariable String catalogueId) {
        return ResponseEntity.ok(productService.getProductsByCatalogueId(catalogueId));
    }

    /** Public list of all shop catalogues (for storefront). */
    @GetMapping("/shop-catalogues")
    public ResponseEntity<List<Product.ShopCatalogue>> listShopCatalogues() {
        return ResponseEntity.ok(productService.getAllShopCatalogues());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }

    @PostMapping("/filter")
    public ResponseEntity<List<Product>> filterProducts(@RequestBody Map<String, Object> filters) {
        String category = (String) filters.get("category");
        @SuppressWarnings("unchecked")
        List<String> sizes = (List<String>) filters.get("sizes");
        
        List<Product> products;
        if (sizes != null && !sizes.isEmpty()) {
            products = productService.getProductsByCategoryAndSizes(category, sizes);
        } else {
            products = productService.getProductsByCategory(category);
        }
        
        return ResponseEntity.ok(products);
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategories() {
        List<String> categories = productService.getAllCategories();
        Map<String, Object> response = new HashMap<>();
        response.put("categories", categories);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        try {
            Product savedProduct = productService.saveProduct(product);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        try {
            Product updatedProduct = productService.updateProduct(id, product);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Low-stock and Management endpoints should be used via AdminController
}

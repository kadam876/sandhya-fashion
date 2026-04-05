package com.sandhya.fashion.controller;

import com.sandhya.fashion.model.Shop;
import com.sandhya.fashion.model.User;
import com.sandhya.fashion.repository.ShopRepository;
import com.sandhya.fashion.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.security.Principal;

@RestController
@RequestMapping("/api/shop")
@CrossOrigin(origins = "*")
public class ShopController {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/setup")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<?> setupShop(@RequestBody Shop shop, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isProfileComplete()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Profile already completed"));
        }

        shop.setOwnerId(user.getId());
        Shop savedShop = shopRepository.save(shop);

        user.setShopId(savedShop.getId());
        user.setProfileComplete(true);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Shop setup successful",
            "shop", savedShop
        ));
    }
}

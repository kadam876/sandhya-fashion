package com.sandhya.fashion.controller;

import com.sandhya.fashion.model.User;
import com.sandhya.fashion.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000", "http://localhost:5175", "http://localhost:5174" })
public class AuthController {

    @Autowired
    private UserService userService;

    @Value("${app.platform-owner.shops-url:http://localhost:5174/owner/shops}")
    private String platformOwnerShopsUrl;

    @PostMapping("/admin/login")
    public ResponseEntity<Map<String, Object>> adminLogin(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        String role = loginRequest.get("role"); // Use consistent key 'role'

        // Attempt login via service - Pass 'OWNER' or 'SHOP_OWNER' check
        Map<String, Object> response = userService.login(email, password, role);

        if ((Boolean) response.get("success")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> user = (Map<String, Object>) response.get("user");

            // Check if user has required roles for admin panel
            String userRole = (String) user.get("role");
            if ("OWNER".equals(userRole) || "SHOP_OWNER".equals(userRole)) {
                response.put("message", "Admin login successful");
                response.put("adminPanel", "/admin/dashboard");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Account role mismatch"); // Consistent error message
                return ResponseEntity.status(403).body(errorResponse);
            }
        }

        // Return the error from userService.login
        return ResponseEntity.status(401).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        String role = loginRequest.get("role");

        Map<String, Object> response = userService.login(email, password, role);

        if ((Boolean) response.get("success")) {
            return ResponseEntity.ok(response);
        } else if ("Account role mismatch".equals(response.get("error"))) {
            return ResponseEntity.status(403).body(response);
        } else {
            return ResponseEntity.status(401).body(response);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user, @RequestParam(required = false) String role) {
        try {
            User registeredUser = userService.register(user, role);
            
            // Explicitly check for successful persistence
            if (registeredUser == null || registeredUser.getId() == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Database persistence failed. User not created.");
                return ResponseEntity.status(500).body(errorResponse);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration successful");
            response.put("user", Map.of(
                    "id", registeredUser.getId(),
                    "email", registeredUser.getEmail(),
                    "name", registeredUser.getName(),
                    "role", registeredUser.getRole(),
                    "isProfileComplete", registeredUser.isProfileComplete(),
                    "isVerified", registeredUser.isVerified()));
            if ("SHOP_OWNER".equals(registeredUser.getRole())) {
                response.put("adminReviewUrl", platformOwnerShopsUrl);
            }
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/bypass-verification")
    public ResponseEntity<Map<String, String>> bypassVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        try {
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Directly update verification in database
            user.setVerified(true);
            userService.save(user);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "User verification bypassed successfully: " + email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to bypass verification: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/verify-user")
    public ResponseEntity<Map<String, String>> verifyUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        try {
            User user = userService.updateVerificationStatusByEmail(email, true);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User verified successfully: " + email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to verify user: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/check-user")
    public ResponseEntity<Map<String, Object>> checkUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        try {
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("role", user.getRole());
            response.put("isVerified", user.isVerified());
            response.put("isActive", user.isActive());
            response.put("isProfileComplete", user.isProfileComplete());
            response.put("shopName", user.getShopName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/fix-password")
    public ResponseEntity<Map<String, String>> fixPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("password");
        
        try {
            userService.updateUserPassword(email, newPassword);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password updated successfully for " + email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to update password: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        // TODO: Implement password reset logic
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset link sent to " + email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> updateProfile(@AuthenticationPrincipal User currentUser, @RequestBody User profileData) {
        try {
            User updatedUser = userService.updateProfile(currentUser.getEmail(), profileData);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("user", Map.of(
                    "id", updatedUser.getId(),
                    "email", updatedUser.getEmail(),
                    "name", updatedUser.getName(),
                    "role", updatedUser.getRole(),
                    "isProfileComplete", updatedUser.isProfileComplete(),
                    "address", updatedUser.getAddress() != null ? updatedUser.getAddress() : "",
                    "phone", updatedUser.getPhone() != null ? updatedUser.getPhone() : "",
                    "shopName", updatedUser.getShopName() != null ? updatedUser.getShopName() : ""));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}


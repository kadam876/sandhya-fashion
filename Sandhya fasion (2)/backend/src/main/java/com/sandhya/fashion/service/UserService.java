package com.sandhya.fashion.service;

import com.sandhya.fashion.model.Order;
import com.sandhya.fashion.model.User;
import com.sandhya.fashion.repository.OrderRepository;
import com.sandhya.fashion.repository.UserRepository;
import com.sandhya.fashion.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import jakarta.annotation.PostConstruct;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    @Lazy
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        System.out.println("UserService: Loaded user " + email + " with role: " + user.getRole());
        return user;
    }


    @PostConstruct
    public void init() {
        Optional<User> ownerOpt = userRepository.findByEmail("owner@sandhya.com");
        if (ownerOpt.isEmpty()) {
            User owner = new User();
            owner.setName("Platform Owner");
            owner.setEmail("owner@sandhya.com");
            owner.setPassword(passwordEncoder.encode("owner123")); // BCrypt encoded password
            owner.setRole("OWNER");
            owner.setActive(true);
            owner.setVerified(true);
            owner.setProfileComplete(true);
            userRepository.save(owner);
            System.out.println("Default OWNER account created with encoded password: owner@sandhya.com / owner123");
        } else {
            User owner = ownerOpt.get();
            boolean changed = false;
            if (!"OWNER".equals(owner.getRole())) {
                owner.setRole("OWNER");
                changed = true;
            }
            if (!owner.isVerified()) {
                owner.setVerified(true);
                changed = true;
            }
            if (!owner.isActive()) {
                owner.setActive(true);
                changed = true;
            }
            if (!owner.isProfileComplete()) {
                owner.setProfileComplete(true);
                changed = true;
            }
            // Update password to encoded if it's still plain text
            if ("owner123".equals(owner.getPassword())) {
                owner.setPassword(passwordEncoder.encode("owner123"));
                changed = true;
            }
            if (changed) {
                userRepository.save(owner);
                System.out.println("Existing user owner@sandhya.com updated to OWNER role and password encoded");
            }
        }
    }

    public Map<String, Object> login(String email, String password, String providedRole) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Find user by email
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check password (BCrypt comparison)
            if (!passwordEncoder.matches(password, user.getPassword())) {
                response.put("success", false);
                response.put("error", "Invalid email or password");
                return response;
            }

            // Check if user is active
            if (!user.isActive()) {
                response.put("success", false);
                response.put("error", "Account is disabled");
                return response;
            }

            // Validate Role Selection
            // Allow 'OWNER' role to login through 'SHOP_OWNER' toggle as there's no platform owner toggle
            boolean roleMatched = providedRole == null || providedRole.equals(user.getRole());
            if (!roleMatched && "SHOP_OWNER".equals(providedRole) && "OWNER".equals(user.getRole())) {
                roleMatched = true;
            }

            if (!roleMatched) {
                response.put("success", false);
                response.put("error", "Account role mismatch");
                return response;
            }

            // Check verification for SHOP_OWNER
            if ("SHOP_OWNER".equals(user.getRole()) && !user.isVerified()) {
                response.put("success", false);
                response.put("error", "Account not verified. Please contact admin.");
                return response;
            }

            String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

            response.put("token", token);
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("email", user.getEmail());
            userData.put("name", user.getName());
            userData.put("role", user.getRole());
            userData.put("isProfileComplete", user.isProfileComplete());
            userData.put("address", user.getAddress() != null ? user.getAddress() : "");
            userData.put("phone", user.getPhone() != null ? user.getPhone() : "");
            userData.put("shopName", user.getShopName() != null ? user.getShopName() : "");

            response.put("user", userData);
            response.put("success", true);

            return response;
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            response.remove("token");
            response.put("success", false);
            response.put("error", "Invalid email or password");
            return response;
        } catch (org.springframework.security.authentication.DisabledException e) {
            response.remove("token");
            response.put("success", false);
            // ...
            response.put("error", "Account is disabled");
            return response;
        } catch (Exception e) {
            response.remove("token");
            response.put("success", false);
            response.put("error", "Authentication failed: " + e.getMessage());
            return response;
        }
    }

    public User updateUserPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword)); // BCrypt encoded
        return userRepository.save(user);
    }

    public User updateProfile(String email, User profileData) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (profileData.getName() != null) user.setName(profileData.getName());
        if (profileData.getPhone() != null) user.setPhone(profileData.getPhone());
        if (profileData.getAddress() != null) user.setAddress(profileData.getAddress());
        
        // If it's a customer and they have filled the mandatory fields, mark profile as complete
        if ("CUSTOMER".equals(user.getRole())) {
            boolean isComplete = user.getName() != null && !user.getName().isEmpty() &&
                                user.getPhone() != null && !user.getPhone().isEmpty() &&
                                user.getAddress() != null && !user.getAddress().isEmpty();
            user.setProfileComplete(isComplete);
        }
        
        return userRepository.save(user);
    }


    public User register(User user, String role) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Password is stored as BCrypt encoded
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Resolve role from parameter or User object, default to CUSTOMER
        String resolvedRole = role;
        if (resolvedRole == null || resolvedRole.isEmpty()) {
            resolvedRole = user.getRole();
        }
        user.setRole(resolvedRole != null ? resolvedRole : "CUSTOMER");

        // Initialization based on role
        if ("SHOP_OWNER".equals(resolvedRole)) {
            user.setVerified(false); // Shop owner needs manual approval
            user.setProfileComplete(false); // Needs to fill business details
        } else if ("CUSTOMER".equals(resolvedRole)) {
            user.setVerified(true);
            user.setProfileComplete(true); // Customers have no extra onboarding
        } else {
            // OWNER and any other non-customer/non-shop-owner role (e.g. seeded platform owner)
            user.setVerified(true);
            user.setProfileComplete(true);
        }

        user.setActive(true);
        return userRepository.save(user);
    }

    public java.util.List<User> findByAdminId(String adminId) {
        return userRepository.findByAdminId(adminId);
    }

    /**
     * Customers linked to this shop (referral adminId) plus anyone who placed orders with this shop,
     * merged by email with order counts.
     */
    public List<Map<String, Object>> buildMyShopCustomers(String adminId) {
        List<Order> orders = orderRepository.findByAdminId(adminId);
        Map<String, Long> orderCountByEmail = new HashMap<>();
        for (Order o : orders) {
            if (o.getUserId() == null || o.getUserId().isBlank()) {
                continue;
            }
            String em = o.getUserId().trim();
            orderCountByEmail.merge(em, 1L, Long::sum);
        }

        Map<String, Map<String, Object>> byEmailKey = new LinkedHashMap<>();

        for (User u : userRepository.findByAdminId(adminId)) {
            if (u.getEmail() == null || u.getEmail().isBlank()) {
                continue;
            }
            String key = u.getEmail().toLowerCase(Locale.ROOT);
            Map<String, Object> row = new HashMap<>();
            row.put("id", u.getId());
            row.put("name", u.getName() != null && !u.getName().isBlank() ? u.getName() : u.getEmail());
            row.put("email", u.getEmail());
            row.put("phone", u.getPhone());
            row.put("active", u.isActive());
            long oc = orderCountForEmailIgnoreCase(orderCountByEmail, u.getEmail());
            row.put("orderCount", oc);
            byEmailKey.put(key, row);
        }

        for (Map.Entry<String, Long> e : orderCountByEmail.entrySet()) {
            String email = e.getKey();
            String key = email.toLowerCase(Locale.ROOT);
            if (byEmailKey.containsKey(key)) {
                byEmailKey.get(key).put("orderCount", e.getValue());
                continue;
            }
            Optional<User> opt = userRepository.findByEmail(email);
            Map<String, Object> row = new HashMap<>();
            row.put("id", opt.map(User::getId).orElse(email));
            row.put("name", opt.map(u -> u.getName() != null && !u.getName().isBlank() ? u.getName() : email)
                    .orElse(email));
            row.put("email", email);
            row.put("phone", opt.map(User::getPhone).orElse(null));
            row.put("active", opt.map(User::isActive).orElse(true));
            row.put("orderCount", e.getValue());
            byEmailKey.put(key, row);
        }

        return new ArrayList<>(byEmailKey.values());
    }

    private static long orderCountForEmailIgnoreCase(Map<String, Long> orderCountByEmail, String email) {
        if (email == null) {
            return 0L;
        }
        return orderCountByEmail.entrySet().stream()
                .filter(en -> en.getKey().equalsIgnoreCase(email))
                .mapToLong(Map.Entry::getValue)
                .sum();
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    /**
     * Boutique partners for platform owner verification (new signups without shopName included).
     * Merges SHOP_OWNER (any case) and legacy ADMIN rows so nothing is missed in Atlas / mixed data.
     * Returns plain maps so the JSON matches the owner UI (verified, id, email, etc.) without UserDetails noise.
     */
    public List<Map<String, Object>> findAllShops() {
        Map<String, User> byId = new LinkedHashMap<>();
        for (User u : userRepository.findByRoleIgnoreCase("SHOP_OWNER")) {
            if (u.getId() != null) {
                byId.put(u.getId(), u);
            }
        }
        for (User u : userRepository.findByRole("ADMIN")) {
            if (u.getId() != null) {
                byId.putIfAbsent(u.getId(), u);
            }
        }
        return byId.values().stream()
                .sorted(Comparator.comparing(User::isVerified).thenComparing(u -> u.getEmail() != null ? u.getEmail() : ""))
                .map(this::toShopPartnerView)
                .collect(Collectors.toList());
    }

    private Map<String, Object> toShopPartnerView(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("name", u.getName());
        m.put("email", u.getEmail());
        m.put("shopName", u.getShopName());
        m.put("verified", u.isVerified());
        return m;
    }

    public User updateVerificationStatus(String userId, boolean status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(status);
        return userRepository.save(user);
    }

    public User updateVerificationStatusByEmail(String email, boolean status) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(status);
        return userRepository.save(user);
    }

    public Map<String, Object> runMigration() {
        User owner = userRepository.findByEmail("owner@sandhya.com")
                .orElseThrow(() -> new RuntimeException("Owner not found"));
        String ownerId = owner.getId();

        // This would normally be in a ProductRepository/OrderRepository, 
        // but for a one-off we can use the injected services if they exist or just repositories.
        // I will assume the repositories are available.
        return Map.of("message", "Migration prepared. Use specialized service for bulk updates.");
    }
}

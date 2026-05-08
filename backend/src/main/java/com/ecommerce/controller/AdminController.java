package com.ecommerce.controller;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

// All endpoints here are ADMIN only
// SecurityConfig enforces this via .hasRole("ADMIN") on /api/admin/**
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = { "http://localhost:3000",
        "http://localhost:5173",
        "https://ecommerce-full-stack-app.vercel.app" })
public class AdminController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    // -----------------------------------------------
    // GET /api/admin/stats
    // Returns counts for the dashboard cards:
    // total products, total orders, total users
    // -----------------------------------------------
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {

        Map<String, Long> stats = new HashMap<>();

        // count() is a free method from JpaRepository
        stats.put("totalProducts", productRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalUsers", userRepository.count());

        return ResponseEntity.ok(stats);
    }

    // -----------------------------------------------
    // GET /api/admin/orders
    // Returns ALL orders from ALL users
    // Newest orders shown first
    // -----------------------------------------------
    @GetMapping("/orders")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    // -----------------------------------------------
    // PUT /api/admin/orders/{id}/status
    // Admin updates an order's status
    // Body: { "status": "CONFIRMED" }
    // Valid values: PENDING, CONFIRMED, DELIVERED
    // -----------------------------------------------
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");

        // Validate the status value before updating
        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Make sure it's one of the valid enum values
        try {
            // This will throw an exception if status is invalid
            // e.g. "SHIPPED" would fail since it's not in our enum
            com.ecommerce.entity.Order.OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        OrderDTO updated = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}
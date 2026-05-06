package com.ecommerce.controller;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// User endpoints: place order + view own orders
// Admin endpoints are in AdminController (Step 15)
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class OrderController {

    @Autowired
    private OrderService orderService;

    // -----------------------------------------------
    // POST /api/orders
    // Places an order from the user's current cart
    // No body needed — we get everything from the cart in DB
    // -----------------------------------------------
    @PostMapping
    public ResponseEntity<OrderDTO> placeOrder(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        OrderDTO order = orderService.placeOrder(email);
        return ResponseEntity.ok(order);
    }

    // -----------------------------------------------
    // GET /api/orders/my
    // Returns order history for the logged-in user
    // -----------------------------------------------
    @GetMapping("/my")
    public ResponseEntity<List<OrderDTO>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        List<OrderDTO> orders = orderService.getMyOrders(email);
        return ResponseEntity.ok(orders);
    }
}
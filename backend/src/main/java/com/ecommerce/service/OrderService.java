package com.ecommerce.service;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.entity.*;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    // -----------------------------------------------
    // Helper: get user by email from JWT
    // -----------------------------------------------
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // -----------------------------------------------
    // Helper: convert Order entity → OrderDTO
    // -----------------------------------------------
    private OrderDTO toDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus().name());
        dto.setCreatedAt(order.getCreatedAt());

        // Convert each OrderItem to OrderItemDTO
        List<OrderDTO.OrderItemDTO> itemDTOs = order.getOrderItems()
                .stream()
                .map(item -> {
                    OrderDTO.OrderItemDTO itemDTO = new OrderDTO.OrderItemDTO();
                    itemDTO.setProductId(item.getProduct().getId());
                    itemDTO.setProductName(item.getProduct().getName());
                    itemDTO.setProductImageUrl(item.getProduct().getImageUrl());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setPrice(item.getPrice());
                    return itemDTO;
                })
                .collect(Collectors.toList());

        dto.setOrderItems(itemDTOs);
        return dto;
    }

    // -----------------------------------------------
    // PLACE ORDER:
    // 1. Get user's cart items
    // 2. Create Order + OrderItems in DB
    // 3. Clear the cart
    // @Transactional = if anything fails, roll back everything
    // -----------------------------------------------
    @Transactional
    public OrderDTO placeOrder(String email) {

        User user = getUserByEmail(email);

        // Step 1: Get all items in this user's cart
        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        // Can't place an order with an empty cart
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty — add products before ordering");
        }

        // Step 2: Calculate total amount
        double totalAmount = cartItems.stream()
                .mapToDouble(item ->
                        item.getProduct().getPrice() * item.getQuantity())
                .sum();

        // Step 3: Create the Order
        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(totalAmount);
        order.setStatus(Order.OrderStatus.PENDING);

        // Step 4: Create an OrderItem for each cart item
        // We save the price AT TIME OF ORDER — important!
        // If product price changes later, this order still shows original price
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getProduct().getPrice()); // price snapshot
            orderItems.add(orderItem);
        }

        order.setOrderItems(orderItems);

        // Step 5: Save order + all order items to DB
        // CascadeType.ALL on Order means OrderItems are saved automatically
        Order savedOrder = orderRepository.save(order);

        // Step 6: Clear the cart now that order is placed
        cartItemRepository.deleteByUser(user);

        return toDTO(savedOrder);
    }

    // -----------------------------------------------
    // GET MY ORDERS: order history for logged-in user
    // Returns newest orders first
    // -----------------------------------------------
    public List<OrderDTO> getMyOrders(String email) {
        User user = getUserByEmail(email);
        List<Order> orders = orderRepository.findByUser(user);

        return orders.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // -----------------------------------------------
    // GET ALL ORDERS: for admin view
    // Returns all orders from all users, newest first
    // -----------------------------------------------
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // -----------------------------------------------
    // UPDATE ORDER STATUS: admin changes
    // PENDING → CONFIRMED → DELIVERED
    // -----------------------------------------------
    public OrderDTO updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found with id: " + orderId));

        // Convert string like "CONFIRMED" to the enum value
        order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
        Order updated = orderRepository.save(order);
        return toDTO(updated);
    }
}
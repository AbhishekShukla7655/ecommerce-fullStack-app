package com.ecommerce.service;

import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;


    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


    public List<CartItem> getCart(String email) {
        User user = getUserByEmail(email);
        return cartItemRepository.findByUser(user);
    }

    public CartItem addToCart(String email, Long productId, Integer quantity) {
        User user = getUserByEmail(email);


        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existing = cartItemRepository
                .findByUserAndProduct(user, product);

        if (existing.isPresent()) {

            CartItem cartItem = existing.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            return cartItemRepository.save(cartItem);
        } else {

            CartItem cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            return cartItemRepository.save(cartItem);
        }
    }


    public CartItem updateQuantity(String email, Long cartItemId, Integer quantity) {
        User user = getUserByEmail(email);


        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: this cart item is not yours");
        }

        if (quantity <= 0) {

            cartItemRepository.delete(cartItem);
            return null;
        }

        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }

    public void removeFromCart(String email, Long cartItemId) {
        User user = getUserByEmail(email);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));


        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: this cart item is not yours");
        }

        cartItemRepository.delete(cartItem);
    }

    public void clearCart(String email) {
        User user = getUserByEmail(email);
        cartItemRepository.deleteByUser(user);
    }
}
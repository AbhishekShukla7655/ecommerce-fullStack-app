package com.ecommerce.service;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.entity.Product;
import com.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    private ProductDTO toDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setCategory(product.getCategory());
        dto.setStock(product.getStock());
        dto.setImageUrl(product.getImageUrl());
        return dto;
    }

    public List<ProductDTO> getAllProducts(String name, String category) {
        List<Product> products;

        if (name != null && !name.isEmpty() && category != null && !category.isEmpty()) {
            products = productRepository
                    .findByNameContainingIgnoreCaseAndCategory(name, category);

        } else if (name != null && !name.isEmpty()) {

            products = productRepository.findByNameContainingIgnoreCase(name);

        } else if (category != null && !category.isEmpty()) {

            products = productRepository.findByCategory(category);

        } else {

            products = productRepository.findAll();
        }

        return products.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return toDTO(product);
    }

    public ProductDTO addProduct(ProductDTO dto, MultipartFile image) throws IOException {
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCategory(dto.getCategory());
        product.setStock(dto.getStock());

        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image);
            product.setImageUrl(imageUrl); // full Cloudinary URL save hoga
        }

        Product saved = productRepository.save(product);
        return toDTO(saved);
    }

    public ProductDTO updateProduct(Long id, ProductDTO dto,
            MultipartFile image) throws IOException {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCategory(dto.getCategory());
        product.setStock(dto.getStock());

        if (image != null && !image.isEmpty()) {
            if (product.getImageUrl() != null) {
                cloudinaryService.deleteImage(product.getImageUrl());
            }
            String imageUrl = cloudinaryService.uploadImage(image);
            product.setImageUrl(imageUrl);
        }

        Product updated = productRepository.save(product);
        return toDTO(updated);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        if (product.getImageUrl() != null) {
            cloudinaryService.deleteImage(product.getImageUrl());
        }

        productRepository.deleteById(id);
    }
}
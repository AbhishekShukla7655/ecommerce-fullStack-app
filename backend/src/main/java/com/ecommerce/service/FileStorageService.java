package com.ecommerce.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    // -----------------------------------------------
    // SAVE IMAGE: receives file, saves to disk,
    // returns the unique filename stored in MySQL
    // -----------------------------------------------
    public String saveImage(MultipartFile file) throws IOException {

        // Step 1: Validate the file is not empty
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Step 2: Validate file type (only jpg, png, webp allowed)
        String contentType = file.getContentType();
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new RuntimeException(
                    "Invalid file type. Only JPG, PNG, WEBP allowed"
            );
        }


        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }


        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename
                .substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID().toString() + extension;

        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return uniqueFilename;
    }

    // -----------------------------------------------
    // DELETE IMAGE: removes old image file from disk
    // Called when admin edits or deletes a product
    // -----------------------------------------------
    public void deleteImage(String filename) {
        // Don't crash if filename is null or empty
        if (filename == null || filename.isEmpty()) {
            return;
        }

        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log the error but don't crash the app
            // Image cleanup failure shouldn't stop product update
            System.out.println("Could not delete image: " + filename);
        }
    }
}
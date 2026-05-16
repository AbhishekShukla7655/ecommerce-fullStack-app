package com.ecommerce.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

  private final Cloudinary cloudinary;

  // application.properties se values read karo
  public CloudinaryService(
      @Value("${cloudinary.cloud-name}") String cloudName,
      @Value("${cloudinary.api-key}") String apiKey,
      @Value("${cloudinary.api-secret}") String apiSecret) {

    // Cloudinary initialize karo
    cloudinary = new Cloudinary(ObjectUtils.asMap(
        "cloud_name", cloudName,
        "api_key", apiKey,
        "api_secret", apiSecret));
  }

  // -----------------------------------------------
  // Image upload karo Cloudinary pe
  // Returns: Cloudinary URL (permanent)
  // -----------------------------------------------
  public String uploadImage(MultipartFile file) throws IOException {

    // File validate karo
    if (file == null || file.isEmpty()) {
      throw new RuntimeException("File is empty");
    }

    // Allowed types check karo
    String contentType = file.getContentType();
    if (contentType == null || !contentType.startsWith("image/")) {
      throw new RuntimeException("Only image files allowed");
    }

    // Cloudinary pe upload karo
    Map uploadResult = cloudinary.uploader().upload(
        file.getBytes(),
        ObjectUtils.asMap(
            "folder", "ecommerce-products", // Cloudinary folder
            "resource_type", "image"));

    // Secure URL return karo — yahi database mein save hoga
    return (String) uploadResult.get("secure_url");
  }

  // -----------------------------------------------
  // Image delete karo Cloudinary se
  // Called when product delete/update hota hai
  // -----------------------------------------------
  public void deleteImage(String imageUrl) {
    if (imageUrl == null || imageUrl.isEmpty())
      return;

    try {
      // URL se public_id extract karo
      // URL format:
      // https://res.cloudinary.com/cloud/image/upload/v123/ecommerce-products/abc.jpg
      String publicId = extractPublicId(imageUrl);
      ;
      if (publicId != null) {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
      }
    } catch (Exception e) {
      System.out.println("Could not delete image from Cloudinary: " + e.getMessage());
    }
  }

  // URL se public_id nikalo
  private String extractPublicId(String url) {
    try {
      // "upload/" ke baad ka part lo, extension hatao
      int uploadIndex = url.indexOf("upload/");
      if (uploadIndex == -1)
        return null;
      String afterUpload = url.substring(uploadIndex + 7);
      // version number hatao (v1234567/)
      if (afterUpload.startsWith("v")) {
        afterUpload = afterUpload.substring(afterUpload.indexOf("/") + 1);
      }
      // extension hatao
      int dotIndex = afterUpload.lastIndexOf(".");
      if (dotIndex != -1) {
        afterUpload = afterUpload.substring(0, dotIndex);
      }
      return afterUpload;
    } catch (Exception e) {
      return null;
    }
  }
}
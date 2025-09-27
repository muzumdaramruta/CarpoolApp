package com.example.carpool.controllers;

import com.example.carpool.model.User;
import com.example.carpool.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(HttpSession session) {
        // Check if user is authenticated
        if (!isAuthenticated(session)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        List<User> users = userService.findAll();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id, HttpSession session) {
        // Check if user is authenticated
        if (!isAuthenticated(session)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        Optional<User> user = userService.findById(id);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user, HttpSession session) {
        // Check if user is authenticated
        if (!isAuthenticated(session)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        // Check if username or email already exists
        if (userService.findByUsername(user.getUsername()).isPresent()) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        if (userService.findByEmail(user.getEmail()).isPresent()) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        
        userService.save(user);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user, HttpSession session) {
        // Check if user is authenticated
        if (!isAuthenticated(session)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        Optional<User> existingUserOpt = userService.findById(id);
        
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            
            // Preserve the existing password if no new password is provided
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                user.setPassword(existingUser.getPassword());
            }
            
            user.setId(id);
            userService.update(user);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable Long id, HttpSession session) {
        // Check if user is authenticated
        if (!isAuthenticated(session)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        Optional<User> user = userService.findById(id);
        
        if (user.isPresent()) {
            userService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // password update endpoint
    @PutMapping("/{id}/password")
    public ResponseEntity<Map<String, Object>> updatePassword(@PathVariable Long id, 
                                                             @RequestBody Map<String, String> passwordData, 
                                                             HttpSession session) {
        // Check if user is authenticated
        if (!isAuthenticated(session)) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Not authenticated");
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }
        
        // Check if user can only update their own password
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null || !currentUser.getId().equals(id)) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "You can only update your own password");
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        }
        
        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");
        
        if (currentPassword == null || newPassword == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Current password and new password are required");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
        
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Verify current password
            if (!user.getPassword().equals(currentPassword)) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Current password is incorrect");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            // Update password
            user.setPassword(newPassword);
            userService.update(user);
            
            Map<String, Object> success = new HashMap<>();
            success.put("message", "Password updated successfully");
            return new ResponseEntity<>(success, HttpStatus.OK);
        }
        
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    
    @GetMapping("/{id}/profile")
    public ResponseEntity<Map<String, Object>> getUserProfile(@PathVariable Long id, HttpSession session) {
        // Check if user is authenticated
        if (!isAuthenticated(session)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        Optional<User> user = userService.findById(id);
        
        if (user.isPresent()) {
            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.get().getId());
            profile.put("username", user.get().getUsername());
            profile.put("fullName", user.get().getFullName());
            profile.put("email", user.get().getEmail());
            profile.put("phoneNumber", user.get().getPhoneNumber());
            profile.put("role", user.get().getRole());
            
            return new ResponseEntity<>(profile, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpSession session) {
        // Check if user is authenticated
        if (!isAuthenticated(session)) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Not authenticated");
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }
        
        User currentUser = (User) session.getAttribute("currentUser");
        
        if (currentUser != null) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", currentUser.getId());
            userMap.put("username", currentUser.getUsername());
            userMap.put("fullName", currentUser.getFullName());
            userMap.put("email", currentUser.getEmail());
            userMap.put("phoneNumber", currentUser.getPhoneNumber());
            userMap.put("role", currentUser.getRole().toString());
            
            return new ResponseEntity<>(userMap, HttpStatus.OK);
        }
        
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    
    // Helper method to check authentication
    private boolean isAuthenticated(HttpSession session) {
        Boolean isAuthenticated = (Boolean) session.getAttribute("isAuthenticated");
        return isAuthenticated != null && isAuthenticated;
    }
    
    
    @PostMapping("/{id}/profile-image")
    public ResponseEntity<Map<String, Object>> uploadProfileImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image,
            HttpSession session) {
        
        // Check authentication
        if (!isAuthenticated(session)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        try {
            // Validate file
            if (image.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Please select an image file");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            // Check file type
            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "File must be an image");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            // Check file size (5MB limit)
            if (image.getSize() > 5 * 1024 * 1024) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Image size must be less than 5MB");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            // Save image (implement your storage logic)
            String imageUrl = saveProfileImage(id, image);
            
            // Update user profile with image URL
            Optional<User> userOpt = userService.findById(id);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setProfileImageUrl(imageUrl); // Add this field to your User model
                userService.update(user);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile image updated successfully");
            response.put("imageUrl", imageUrl);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to upload image");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}/profile-image")
    public ResponseEntity<Map<String, Object>> removeProfileImage(
            @PathVariable Long id,
            HttpSession session) {
        
        // Check authentication
        if (!isAuthenticated(session)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        try {
            Optional<User> userOpt = userService.findById(id);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                // Delete physical file if exists
                if (user.getProfileImageUrl() != null) {
                    deleteProfileImage(user.getProfileImageUrl());
                }
                
                // Remove image URL from user
                user.setProfileImageUrl(null);
                userService.update(user);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile image removed successfully");
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to remove image");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Helper method to save image
    private String saveProfileImage(Long userId, MultipartFile image) throws IOException {
        // Create upload directory if it doesn't exist
        String uploadDir = "uploads/profile-images/";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = image.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = "user_" + userId + "_" + System.currentTimeMillis() + extension;
        
        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Return URL (adjust based on your setup)
        return "/uploads/profile-images/" + filename;
    }

    // Helper method to delete image
    private void deleteProfileImage(String imageUrl) {
        try {
            Path filePath = Paths.get("." + imageUrl);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log error but don't fail the request
            System.err.println("Failed to delete image file: " + e.getMessage());
        }
    }
}
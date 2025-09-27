package com.example.carpool.controllers;

import com.example.carpool.model.User;
import com.example.carpool.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.carpool.validator.UserValidator;
import com.example.carpool.validator.LoginValidator;
import com.example.carpool.exception.DuplicateResourceException;
import com.example.carpool.exception.ValidationException;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private UserValidator userValidator;

    @Autowired
    private LoginValidator loginValidator;
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials, HttpSession session) {
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");
            
            // Validate input using the validator
            loginValidator.validate(username, password);
            
            // Try to find the user
            Optional<User> userOpt = userService.findByUsername(username);
            
            // Check if user exists and password matches
            if (!userOpt.isPresent() || !userOpt.get().getPassword().equals(password)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid username or password");
                return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
            }
            
            User user = userOpt.get();
            
            // Store user in session
            session.setAttribute("currentUser", user);
            session.setAttribute("userId", user.getId());
            session.setAttribute("isAuthenticated", true);
            
            // Generate mock token
            String mockToken = "mock-jwt-token-" + System.currentTimeMillis();
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", mockToken);
            
            // Create a user object without sensitive data
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("username", user.getUsername());
            userMap.put("fullName", user.getFullName());
            userMap.put("email", user.getEmail());
            userMap.put("phoneNumber", user.getPhoneNumber());
            userMap.put("role", user.getRole().toString());
            
            response.put("user", userMap);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (ValidationException ex) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", ex.getMessage());
            errorResponse.put("errors", ex.getErrors());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception ex) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "An unexpected error occurred");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        try {
            // Invalidate session
            session.invalidate();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Logged out successfully");
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception ex) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error during logout");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        Boolean isAuthenticated = (Boolean) session.getAttribute("isAuthenticated");
        User currentUser = (User) session.getAttribute("currentUser");
        
        if (isAuthenticated != null && isAuthenticated && currentUser != null) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", currentUser.getId());
            userMap.put("username", currentUser.getUsername());
            userMap.put("fullName", currentUser.getFullName());
            userMap.put("email", currentUser.getEmail());
            userMap.put("phoneNumber", currentUser.getPhoneNumber());
            userMap.put("role", currentUser.getRole().toString());
            
            response.put("isAuthenticated", true);
            response.put("user", userMap);
        } else {
            response.put("isAuthenticated", false);
            response.put("user", null);
        }
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        // Validate user input
        userValidator.validateForRegistration(user);
        
        // Check for duplicate username
        if (userService.findByUsername(user.getUsername()).isPresent()) {
            throw new DuplicateResourceException("Username already exists", "username");
        }
        
        // Check for duplicate email
        if (userService.findByEmail(user.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already exists", "email");
        }
        
        // Save the user
        userService.save(user);
        
        // Return success response
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("userId", user.getId());
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
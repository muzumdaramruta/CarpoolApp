package com.example.carpool.validator;

import com.example.carpool.exception.ValidationException;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
public class LoginValidator {
    
    /**
     * Validates login credentials
     * @param username the username to validate
     * @param password the password to validate
     * @throws ValidationException if validation fails
     */
    public void validate(String username, String password) {
        Map<String, String> errors = new HashMap<>();
        
        // Validate username
        if (username == null || username.trim().isEmpty()) {
            errors.put("username", "Username is required");
        }
        
        // Validate password
        if (password == null || password.trim().isEmpty()) {
            errors.put("password", "Password is required");
        }
        
        // If there are validation errors, throw an exception
        if (!errors.isEmpty()) {
            throw new ValidationException("Login validation failed", errors);
        }
    }
}
package com.example.carpool.validator;


import com.example.carpool.model.User;
import com.example.carpool.exception.ValidationException;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Component
public class UserValidator {
    
    // Email regex pattern
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$", Pattern.CASE_INSENSITIVE);
    
    // Phone number regex pattern
    private static final Pattern PHONE_PATTERN = 
        Pattern.compile("^\\d{10}$");  // Simple 10-digit pattern, adjust as needed
    
    // Username regex pattern
    private static final Pattern USERNAME_PATTERN = 
        Pattern.compile("^[a-zA-Z0-9_-]{3,20}$");
    
    // Password regex pattern (min 6 chars, at least 1 letter and 1 number)
    private static final Pattern PASSWORD_PATTERN = 
        Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$");
    
    /**
     * Validates a user entity for registration
     * @param user the user to validate
     * @throws ValidationException if validation fails
     */
    public void validateForRegistration(User user) {
        Map<String, String> errors = new HashMap<>();
        
        // Validate username
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            errors.put("username", "Username is required");
        } else if (!USERNAME_PATTERN.matcher(user.getUsername()).matches()) {
            errors.put("username", "Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens");
        }
        
        // Validate password
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            errors.put("password", "Password is required");
        } else if (!PASSWORD_PATTERN.matcher(user.getPassword()).matches()) {
            errors.put("password", "Password must be at least 6 characters long and include at least one letter and one number");
        }
        
        // Validate email
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            errors.put("email", "Email is required");
        } else if (!EMAIL_PATTERN.matcher(user.getEmail()).matches()) {
            errors.put("email", "Invalid email format");
        }
        
        // Validate fullName
        if (user.getFullName() == null || user.getFullName().trim().isEmpty()) {
            errors.put("fullName", "Full name is required");
        }
        
        // Validate phone number
        if (user.getPhoneNumber() == null || user.getPhoneNumber().trim().isEmpty()) {
            errors.put("phoneNumber", "Phone number is required");
        } else if (!PHONE_PATTERN.matcher(user.getPhoneNumber().replaceAll("[^0-9]", "")).matches()) {
            errors.put("phoneNumber", "Phone number must be 10 digits");
        }
        
        // Validate role
        if (user.getRole() == null) {
            errors.put("role", "Role is required");
        }
        
        // If there are validation errors, throw an exception
        if (!errors.isEmpty()) {
            throw new ValidationException("User validation failed", errors);
        }
    }
}

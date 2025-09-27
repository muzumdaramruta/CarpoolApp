package com.example.carpool.exception;

public class ResourceInUseException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;
    
    public ResourceInUseException(String message) {
        super(message);
    }
    
    public ResourceInUseException(String resourceName, String reason) {
        super(String.format("%s cannot be deleted because %s", resourceName, reason));
    }
}
package com.example.carpool.exception;

public class DuplicateResourceException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    private final String field;
    
    public DuplicateResourceException(String message, String field) {
        super(message);
        this.field = field;
    }
    
    public String getField() {
        return field;
    }
}
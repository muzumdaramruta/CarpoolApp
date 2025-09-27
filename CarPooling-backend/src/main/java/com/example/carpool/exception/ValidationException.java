package com.example.carpool.exception;

import java.util.Map;

public class ValidationException extends RuntimeException {
	private static final long serialVersionUID = 1L;
    private final Map<String, String> errors;
    
    public ValidationException(String message, Map<String, String> errors) {
        super(message);
        this.errors = errors;
    }
    
    public Map<String, String> getErrors() {
        return errors;
    }
}
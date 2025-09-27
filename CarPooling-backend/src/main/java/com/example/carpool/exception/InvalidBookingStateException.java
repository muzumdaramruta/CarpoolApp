package com.example.carpool.exception;

public class InvalidBookingStateException extends RuntimeException {
    
    public InvalidBookingStateException(String message) {
        super(message);
    }
    
    public InvalidBookingStateException(String currentState, String requiredState) {
        super("Invalid booking state: Current state is " + currentState + 
              ", but required state is " + requiredState);
    }
}
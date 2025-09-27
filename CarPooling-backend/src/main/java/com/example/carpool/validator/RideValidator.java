package com.example.carpool.validator;

import com.example.carpool.exception.ValidationException;
import org.springframework.stereotype.Component;
import com.example.carpool.model.Ride;
import com.example.carpool.model.Vehicle;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
public class RideValidator {

    /**
     * Validates a ride before creation or update
     * @param ride the ride to validate
     * @throws ValidationException if validation fails
     */
    public void validateRide(Ride ride, Vehicle vehicle) {
        Map<String, String> errors = new HashMap<>();
        
        // Validate origin location
        if (ride.getOriginLocation() == null || ride.getOriginLocation().trim().isEmpty()) {
            errors.put("originLocation", "Origin location is required");
        } else if (ride.getOriginLocation().length() > 100) {
            errors.put("originLocation", "Origin location cannot exceed 100 characters");
        }
        
        // Validate destination location
        if (ride.getDestinationLocation() == null || ride.getDestinationLocation().trim().isEmpty()) {
            errors.put("destinationLocation", "Destination location is required");
        } else if (ride.getDestinationLocation().length() > 100) {
            errors.put("destinationLocation", "Destination location cannot exceed 100 characters");
        }
        
        // Validate departure time
        if (ride.getDepartureTime() == null) {
            errors.put("departureTime", "Departure time is required");
        } else if (ride.getDepartureTime().isBefore(LocalDateTime.now())) {
            errors.put("departureTime", "Departure time must be in the future");
        }
        
        // Validate available seats
        if (ride.getAvailableSeats() == null) {
            errors.put("availableSeats", "Available seats is required");
        } else if (ride.getAvailableSeats() < 1) {
            errors.put("availableSeats", "Available seats must be at least 1");
        } else if (vehicle != null && ride.getAvailableSeats() > vehicle.getCapacity()) {
            errors.put("availableSeats", "Available seats cannot exceed vehicle capacity of " + vehicle.getCapacity());
        }
        
        // Validate fare amount
        if (ride.getFareAmount() == null) {
            errors.put("fareAmount", "Fare amount is required");
        } else if (ride.getFareAmount().compareTo(BigDecimal.ZERO) < 0) {
            errors.put("fareAmount", "Fare amount cannot be negative");
        }
        
        // If there are validation errors, throw an exception
        if (!errors.isEmpty()) {
            throw new ValidationException("Ride validation failed", errors);
        }
    }
}
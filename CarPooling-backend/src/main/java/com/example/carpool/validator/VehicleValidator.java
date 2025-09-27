package com.example.carpool.validator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.carpool.model.Vehicle;
import com.example.carpool.model.Ride;
import com.example.carpool.dao.RideDao;
import com.example.carpool.exception.ResourceInUseException;
import com.example.carpool.exception.ValidationException;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Component
public class VehicleValidator {
    
    @Autowired
    private RideDao rideDao;
    
    /**
     * Validates if a vehicle can be deleted
     * @param vehicle the vehicle to validate
     * @throws ResourceInUseException if vehicle has active rides
     */
    public void validateDeletion(Vehicle vehicle) {
        // Get all rides for this vehicle
        List<Ride> rides = rideDao.findRidesByVehicleId(vehicle.getId());
        
        // Check if any rides are not completed/cancelled
        for (Ride ride : rides) {
            if (ride.getStatus() != Ride.RideStatus.COMPLETED && 
                ride.getStatus() != Ride.RideStatus.CANCELLED) {
                throw new ResourceInUseException("Vehicle", 
                    "it has active rides. All rides must be completed or cancelled before deleting.");
            }
        }
    }
    
    /**
     * Validates a vehicle for creation or update
     * @param vehicle the vehicle to validate
     * @throws ValidationException if validation fails
     */
    public void validateVehicle(Vehicle vehicle) {
        Map<String, String> errors = new HashMap<>();
        
        // Validate make
        if (vehicle.getMake() == null || vehicle.getMake().trim().isEmpty()) {
            errors.put("make", "Make is required");
        } else if (vehicle.getMake().length() > 50) {
            errors.put("make", "Make cannot exceed 50 characters");
        }
        
        // Validate model
        if (vehicle.getModel() == null || vehicle.getModel().trim().isEmpty()) {
            errors.put("model", "Model is required");
        } else if (vehicle.getModel().length() > 50) {
            errors.put("model", "Model cannot exceed 50 characters");
        }
        
        // Validate license plate
        if (vehicle.getLicensePlate() == null || vehicle.getLicensePlate().trim().isEmpty()) {
            errors.put("licensePlate", "License plate is required");
        } else if (vehicle.getLicensePlate().length() > 20) {
            errors.put("licensePlate", "License plate cannot exceed 20 characters");
        }
        
        // Validate capacity
        if (vehicle.getCapacity() < 1) {
            errors.put("capacity", "Capacity must be at least 1");
        } else if (vehicle.getCapacity() > 10) {
            errors.put("capacity", "Capacity cannot exceed 10");
        }
        
        // If there are validation errors, throw an exception
        if (!errors.isEmpty()) {
            throw new ValidationException("Vehicle validation failed", errors);
        }
    }
}
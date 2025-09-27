package com.example.carpool.controllers;

import com.example.carpool.model.User;
import com.example.carpool.model.Vehicle;
import com.example.carpool.services.UserService;
import com.example.carpool.services.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.carpool.exception.ResourceNotFoundException;
import com.example.carpool.exception.ValidationException;
import com.example.carpool.validator.VehicleValidator;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private UserService userService;
    
    @Autowired
    private VehicleValidator vehicleValidator;

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        List<Vehicle> vehicles = vehicleService.findAll();
        return new ResponseEntity<>(vehicles, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        Optional<Vehicle> vehicle = vehicleService.findById(id);
        return vehicle.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Vehicle>> getVehiclesByUserId(@PathVariable Long userId) {
        Optional<User> user = userService.findById(userId);
        
        if (user.isPresent()) {
            List<Vehicle> vehicles = vehicleService.findByOwner(user.get());
            return new ResponseEntity<>(vehicles, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createVehicle(@PathVariable Long userId, @RequestBody Vehicle vehicle) {
        try {
            Optional<User> user = userService.findById(userId);
            
            if (!user.isPresent()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "User not found");
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }
            
            // Verify that the user is a driver
            if (user.get().getRole() != User.UserRole.DRIVER) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Only drivers can register vehicles");
                return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
            }
            
            // Validate the vehicle
            vehicleValidator.validateVehicle(vehicle);
            
            // Set the owner and save
            vehicle.setOwner(user.get());
            vehicleService.save(vehicle);
            
            return new ResponseEntity<>(vehicle, HttpStatus.CREATED);
        } catch (ValidationException ex) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", ex.getMessage());
            errorResponse.put("errors", ex.getErrors());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception ex) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to create vehicle: " + ex.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        Optional<Vehicle> existingVehicle = vehicleService.findById(id);
        
        if (existingVehicle.isPresent()) {
            // Ensure owner is preserved
            vehicle.setId(id);
            vehicle.setOwner(existingVehicle.get().getOwner());
            vehicleService.update(vehicle);
            return new ResponseEntity<>(vehicle, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        // Find the vehicle
        Vehicle vehicle = vehicleService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));
        
        // Validate that the vehicle can be deleted
        vehicleValidator.validateDeletion(vehicle);
        
        // Delete the vehicle
        vehicleService.deleteById(id);
        
        return ResponseEntity.noContent().build();
    }
}
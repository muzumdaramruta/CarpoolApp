package com.example.carpool.controllers;

import com.example.carpool.exception.ValidationException;
import com.example.carpool.model.Ride;
import com.example.carpool.model.User;
import com.example.carpool.model.Vehicle;
import com.example.carpool.services.RideService;
import com.example.carpool.services.UserService;
import com.example.carpool.services.VehicleService;
import com.example.carpool.validator.RideValidator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    @Autowired
    private RideService rideService;

    @Autowired
    private UserService userService;

    @Autowired
    private VehicleService vehicleService;
    
    @Autowired
    private RideValidator rideValidator;

    @GetMapping
    public ResponseEntity<List<Ride>> getAllRides() {
        List<Ride> rides = rideService.findAll();
        return new ResponseEntity<>(rides, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ride> getRideById(@PathVariable Long id) {
        Optional<Ride> ride = rideService.findById(id);
        return ride.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Ride>> getRidesByDriverId(@PathVariable Long driverId) {
        Optional<User> driver = userService.findById(driverId);
        
        if (driver.isPresent()) {
            List<Ride> rides = rideService.findByDriver(driver.get());
            return new ResponseEntity<>(rides, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchRides(
        @RequestParam String origin,
        @RequestParam String destination,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime departureTime
    ) {
        try {
            System.out.println("Search params: Origin=" + origin +
                    ", Destination=" + destination +
                    ", DateTime=" + departureTime);

            List<Ride> rides = rideService.findAvailableRides(origin, destination, departureTime);

            System.out.println("Found " + rides.size() + " rides");
            rides.forEach(ride -> System.out.println("Ride: " + ride.getId() +
                    ", Origin=" + ride.getOriginLocation() +
                    ", Dest=" + ride.getDestinationLocation() +
                    ", Time=" + ride.getDepartureTime()));

            if (rides.isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "No rides found for your search criteria");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }

            return new ResponseEntity<>(rides, HttpStatus.OK);
        } catch (Exception ex) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error searching for rides: " + ex.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/popular")
    public ResponseEntity<List<Ride>> getPopularRoutes(@RequestParam(defaultValue = "5") int limit) {
        List<Ride> popularRoutes = rideService.findPopularRoutes(limit);
        return new ResponseEntity<>(popularRoutes, HttpStatus.OK);
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<List<Ride>> getUpcomingRides() {
        List<Ride> upcomingRides = rideService.findUpcomingRides();
        return new ResponseEntity<>(upcomingRides, HttpStatus.OK);
    }

    @PostMapping("/driver/{driverId}/vehicle/{vehicleId}")
    public ResponseEntity<?> createRide(
            @PathVariable Long driverId,
            @PathVariable Long vehicleId,
            @RequestBody Ride ride) {
        try {
            Optional<User> userOpt = userService.findById(driverId);
            if (!userOpt.isPresent()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "User not found");
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }

            User user = userOpt.get();

            if (user.getRole() != User.UserRole.DRIVER) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Only drivers can create rides");
                return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
            }

            Optional<Vehicle> vehicleOpt = vehicleService.findById(vehicleId);
            if (!vehicleOpt.isPresent()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Vehicle not found");
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }

            Vehicle vehicle = vehicleOpt.get();

            if (!vehicle.getOwner().getId().equals(driverId)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "The vehicle does not belong to this user");
                return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
            }

            rideValidator.validateRide(ride, vehicle);

            ride.setDriver(user);
            ride.setVehicle(vehicle);
            ride.setStatus(Ride.RideStatus.SCHEDULED);

            rideService.save(ride);

            return new ResponseEntity<>(ride, HttpStatus.CREATED);
        } catch (ValidationException ex) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", ex.getMessage());
            errorResponse.put("errors", ex.getErrors());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception ex) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to create ride: " + ex.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ride> updateRide(@PathVariable Long id, @RequestBody Ride ride) {
        Optional<Ride> existingRide = rideService.findById(id);
        
        if (existingRide.isPresent()) {
            ride.setId(id);
            ride.setDriver(existingRide.get().getDriver());
            ride.setVehicle(existingRide.get().getVehicle());
            rideService.update(ride);
            return new ResponseEntity<>(ride, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateRideStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            System.out.println("Update ride status request - ID: " + id + ", Status: " + status);
            
            Optional<Ride> rideOpt = rideService.findById(id);
            
            if (!rideOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Ride not found");
                return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
            }
            
            Ride ride = rideOpt.get();
            
            if (status == null || status.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Status is required");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            try {
                Ride.RideStatus newStatus = Ride.RideStatus.valueOf(status);
                
                System.out.println("Updating ride " + id + " from " + ride.getStatus() + " to " + newStatus);
                
                rideService.updateRideStatus(ride, newStatus);
                
                return new ResponseEntity<>(ride, HttpStatus.OK);
                
            } catch (IllegalArgumentException e) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid status: " + status);
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
        } catch (Exception e) {
            System.err.println("Error updating ride status: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteRide(@PathVariable Long id) {
        Optional<Ride> ride = rideService.findById(id);
        
        if (ride.isPresent()) {
            if (ride.get().getStatus() == Ride.RideStatus.SCHEDULED && 
                (ride.get().getBookings() == null || ride.get().getBookings().isEmpty())) {
                rideService.deleteById(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
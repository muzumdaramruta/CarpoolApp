package com.example.carpool.controllers;

import com.example.carpool.model.Rating;
import com.example.carpool.model.User;
import com.example.carpool.services.RatingService;
import com.example.carpool.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    @Autowired
    private RatingService ratingService;
    
    @Autowired
    private UserService userService;

    // Create or update a rating
    @PostMapping
    public ResponseEntity<Map<String, Object>> createRating(
            @RequestBody Map<String, Object> ratingData,
            HttpSession session) {
        
        // Check authentication
        if (!isAuthenticated(session)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        try {
            Long driverId = Long.valueOf(ratingData.get("driverId").toString());
            Long riderId = Long.valueOf(ratingData.get("riderId").toString());
            Long rideId = Long.valueOf(ratingData.get("rideId").toString());
            Integer rating = Integer.valueOf(ratingData.get("rating").toString());
            String comment = ratingData.get("comment") != null ? ratingData.get("comment").toString() : "";
            
            // Verify the current user is the rider
            User currentUser = (User) session.getAttribute("currentUser");
            if (!currentUser.getId().equals(riderId)) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "You can only submit ratings for your own rides");
                return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
            }
            
            Rating createdRating = ratingService.createRating(driverId, riderId, rideId, rating, comment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Rating submitted successfully");
            response.put("rating", createdRating);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to submit rating: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get driver's average rating and stats
    @GetMapping("/driver/{driverId}/summary")
    public ResponseEntity<Map<String, Object>> getDriverRatingSummary(@PathVariable Long driverId) {
        try {
            Double averageRating = ratingService.getAverageRatingForDriver(driverId);
            Long totalRatings = ratingService.getTotalRatingsForDriver(driverId);
            List<Rating> recentRatings = ratingService.findRecentRatingsForDriver(driverId, 5);
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("averageRating", Math.round(averageRating * 10.0) / 10.0); // Round to 1 decimal
            summary.put("totalRatings", totalRatings);
            summary.put("recentRatings", recentRatings);
            
            return new ResponseEntity<>(summary, HttpStatus.OK);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to get driver rating summary: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all ratings for a driver
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Rating>> getDriverRatings(@PathVariable Long driverId) {
        try {
            Optional<User> driverOpt = userService.findById(driverId);
            if (!driverOpt.isPresent()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            List<Rating> ratings = ratingService.findByDriver(driverOpt.get());
            return new ResponseEntity<>(ratings, HttpStatus.OK);
            
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Check if rider can rate a specific ride
    @GetMapping("/can-rate")
    public ResponseEntity<Map<String, Object>> canRateRide(
            @RequestParam Long rideId,
            @RequestParam Long riderId,
            HttpSession session) {
        
        // Check authentication
        if (!isAuthenticated(session)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        try {
            // Verify the current user is the rider
            User currentUser = (User) session.getAttribute("currentUser");
            if (!currentUser.getId().equals(riderId)) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Unauthorized");
                return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
            }
            
            boolean canRate = ratingService.canRateRide(rideId, riderId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("canRate", canRate);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to check rating eligibility: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get rating by ride and rider
    @GetMapping("/ride/{rideId}/rider/{riderId}")
    public ResponseEntity<Rating> getRatingByRideAndRider(
            @PathVariable Long rideId,
            @PathVariable Long riderId,
            HttpSession session) {
        
        // Check authentication
        if (!isAuthenticated(session)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        try {
            // Verify the current user is the rider
            User currentUser = (User) session.getAttribute("currentUser");
            if (!currentUser.getId().equals(riderId)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            
            Optional<User> riderOpt = userService.findById(riderId);
            if (!riderOpt.isPresent()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            // This would require getting the ride - simplified for now
            // You might want to add this functionality
            
            return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
            
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Helper method to check authentication
    private boolean isAuthenticated(HttpSession session) {
        Boolean isAuthenticated = (Boolean) session.getAttribute("isAuthenticated");
        return isAuthenticated != null && isAuthenticated;
    }
}
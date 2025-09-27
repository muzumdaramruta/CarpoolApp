package com.example.carpool.services;

import com.example.carpool.model.Rating;
import com.example.carpool.model.User;
import com.example.carpool.model.Ride;
import java.util.List;
import java.util.Optional;

public interface RatingService {
    void save(Rating rating);
    void update(Rating rating);
    void delete(Rating rating);
    void deleteById(Long id);
    Optional<Rating> findById(Long id);
    List<Rating> findAll();
    List<Rating> findByDriver(User driver);
    List<Rating> findByRider(User rider);
    Optional<Rating> findByRideAndRider(Ride ride, User rider);
    Double getAverageRatingForDriver(Long driverId);
    Long getTotalRatingsForDriver(Long driverId);
    List<Rating> findRecentRatingsForDriver(Long driverId, int limit);
    Rating createRating(Long driverId, Long riderId, Long rideId, Integer rating, String comment);
    boolean canRateRide(Long rideId, Long riderId);
}

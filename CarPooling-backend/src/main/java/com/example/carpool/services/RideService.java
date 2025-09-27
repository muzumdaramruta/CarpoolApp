package com.example.carpool.services;

import com.example.carpool.model.Ride;
import com.example.carpool.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RideService {
    Optional<Ride> findById(Long id);
    List<Ride> findAll();
    List<Ride> findByDriver(User driver);
    List<Ride> findAvailableRides(String originLocation, String destinationLocation, LocalDateTime departureTime);
    List<Ride> findByStatus(Ride.RideStatus status);
    List<Ride> findByDriverAndStatus(User driver, Ride.RideStatus status);
    List<Ride> findUpcomingRides();
    List<Ride> findPopularRoutes(int limit);
    void save(Ride ride);
    void update(Ride ride);
    void delete(Ride ride);
    void deleteById(Long id);
    void updateRideStatus(Ride ride, Ride.RideStatus status);
}
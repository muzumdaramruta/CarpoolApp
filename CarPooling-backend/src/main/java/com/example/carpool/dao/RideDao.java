package com.example.carpool.dao;

import com.example.carpool.model.Ride;
import com.example.carpool.model.User;

import java.time.LocalDateTime;
import java.util.List;

public interface RideDao extends BaseDao<Ride> {
    List<Ride> findByDriver(User driver);
    List<Ride> findAvailableRides(String originLocation, String destinationLocation, LocalDateTime departureTime);
    List<Ride> findByStatus(Ride.RideStatus status);
    List<Ride> findByDriverAndStatus(User driver, Ride.RideStatus status);
    List<Ride> findUpcomingRides(); // Scheduled rides in the near future
    List<Ride> findPopularRoutes(int limit); // Most frequently booked routes
    long countActiveRidesByVehicleId(Long vehicleId);
    List<Ride> findRidesByVehicleId(Long vehicleId);
}

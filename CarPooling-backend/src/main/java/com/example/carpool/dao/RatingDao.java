package com.example.carpool.dao;

import com.example.carpool.model.Rating;
import com.example.carpool.model.User;
import com.example.carpool.model.Ride;
import java.util.List;
import java.util.Optional;

public interface RatingDao extends BaseDao<Rating> {
    List<Rating> findByDriver(User driver);
    List<Rating> findByRider(User rider);
    Optional<Rating> findByRideAndRider(Ride ride, User rider);
    Double getAverageRatingForDriver(Long driverId);
    Long getTotalRatingsForDriver(Long driverId);
    List<Rating> findRecentRatingsForDriver(Long driverId, int limit);
}
package com.example.carpool.services;

import com.example.carpool.dao.RatingDao;
import com.example.carpool.model.Rating;
import com.example.carpool.model.User;
import com.example.carpool.model.Ride;
import com.example.carpool.model.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RatingServiceImpl implements RatingService {

    @Autowired
    private RatingDao ratingDao;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private RideService rideService;
    
    @Autowired
    private BookingService bookingService;

    @Override
    public void save(Rating rating) {
        ratingDao.save(rating);
    }

    @Override
    public void update(Rating rating) {
        ratingDao.update(rating);
    }

    @Override
    public void delete(Rating rating) {
        ratingDao.delete(rating);
    }

    @Override
    public void deleteById(Long id) {
        ratingDao.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Rating> findById(Long id) {
        return ratingDao.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Rating> findAll() {
        return ratingDao.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Rating> findByDriver(User driver) {
        return ratingDao.findByDriver(driver);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Rating> findByRider(User rider) {
        return ratingDao.findByRider(rider);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Rating> findByRideAndRider(Ride ride, User rider) {
        return ratingDao.findByRideAndRider(ride, rider);
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageRatingForDriver(Long driverId) {
        return ratingDao.getAverageRatingForDriver(driverId);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getTotalRatingsForDriver(Long driverId) {
        return ratingDao.getTotalRatingsForDriver(driverId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Rating> findRecentRatingsForDriver(Long driverId, int limit) {
        return ratingDao.findRecentRatingsForDriver(driverId, limit);
    }

    @Override
    public Rating createRating(Long driverId, Long riderId, Long rideId, Integer rating, String comment) {
        // Validate inputs
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        
        Optional<User> driverOpt = userService.findById(driverId);
        Optional<User> riderOpt = userService.findById(riderId);
        Optional<Ride> rideOpt = rideService.findById(rideId);
        
        if (!driverOpt.isPresent()) {
            throw new IllegalArgumentException("Driver not found");
        }
        
        if (!riderOpt.isPresent()) {
            throw new IllegalArgumentException("Rider not found");
        }
        
        if (!rideOpt.isPresent()) {
            throw new IllegalArgumentException("Ride not found");
        }
        
        User driver = driverOpt.get();
        User rider = riderOpt.get();
        Ride ride = rideOpt.get();
        
        // Check if rider can rate this ride
        if (!canRateRide(rideId, riderId)) {
            throw new IllegalArgumentException("You cannot rate this ride");
        }
        
        // Check if rating already exists
        Optional<Rating> existingRating = findByRideAndRider(ride, rider);
        if (existingRating.isPresent()) {
            // Update existing rating
            Rating existing = existingRating.get();
            existing.setRating(rating);
            existing.setComment(comment);
            update(existing);
            return existing;
        } else {
            // Create new rating
            Rating newRating = new Rating(driver, rider, ride, rating, comment);
            save(newRating);
            return newRating;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canRateRide(Long rideId, Long riderId) {
        Optional<Ride> rideOpt = rideService.findById(rideId);
        if (!rideOpt.isPresent()) {
            return false;
        }
        
        Ride ride = rideOpt.get();
        
        // Can only rate completed rides
        if (ride.getStatus() != Ride.RideStatus.COMPLETED) {
            return false;
        }
        
        // Check if rider had an accepted booking for this ride
        List<Booking> bookings = bookingService.findByRide(ride);
        return bookings.stream()
            .anyMatch(booking -> 
                booking.getRider().getId().equals(riderId) && 
                (booking.getStatus() == Booking.BookingStatus.ACCEPTED || 
                 booking.getStatus() == Booking.BookingStatus.COMPLETED)
            );
    }
}
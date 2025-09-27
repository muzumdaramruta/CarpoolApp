package com.example.carpool.services;

import com.example.carpool.dao.BookingDao;
import com.example.carpool.exception.InvalidBookingStateException;
import com.example.carpool.model.Booking;
import com.example.carpool.model.Ride;
import com.example.carpool.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingDao bookingDao;

    @Autowired
    @Lazy
    private RideService rideService;

    @Override
    @Transactional(readOnly = true)
    public Optional<Booking> findById(Long id) {
        return bookingDao.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Booking> findAll() {
        return bookingDao.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Booking> findByRider(User rider) {
        return bookingDao.findByRider(rider);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Booking> findByRide(Ride ride) {
        return bookingDao.findByRide(ride);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Booking> findByStatus(Booking.BookingStatus status) {
        return bookingDao.findByStatus(status);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Booking> findByRiderAndStatus(User rider, Booking.BookingStatus status) {
        return bookingDao.findByRiderAndStatus(rider, status);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Booking> findByRideAndStatus(Ride ride, Booking.BookingStatus status) {
        return bookingDao.findByRideAndStatus(ride, status);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Booking> findPaidBookings() {
        return bookingDao.findPaidBookings();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Booking> findUnpaidBookings() {
        return bookingDao.findUnpaidBookings();
    }

    @Override
    public void save(Booking booking) {
        bookingDao.save(booking);
    }

    @Override
    public void update(Booking booking) {
        bookingDao.update(booking);
    }

    @Override
    public void delete(Booking booking) {
        bookingDao.delete(booking);
    }

    @Override
    public void deleteById(Long id) {
        bookingDao.deleteById(id);
    }

    @Override
    public void updateBookingStatus(Booking booking, Booking.BookingStatus status) {
        booking.setStatus(status);
        bookingDao.update(booking);
    }

    /**
     * Confirm booking after payment (replaces manual driver acceptance)
     */
    public void confirmBookingAfterPayment(Booking booking) {
        // Update booking status to ACCEPTED
        booking.setStatus(Booking.BookingStatus.ACCEPTED);
        bookingDao.update(booking);
        
        // Update available seats on the ride
        Ride ride = booking.getRide();
        ride.setAvailableSeats(ride.getAvailableSeats() - booking.getNumberOfSeats());
        rideService.update(ride);
        
        System.out.println("Confirmed booking ID: " + booking.getId() + 
                          " after payment. Reduced available seats by " + booking.getNumberOfSeats());
    }

    @Override
    public void cancelBooking(Booking booking) {
        try {
            System.out.println("Attempting to cancel booking ID: " + booking.getId());
            
            Booking.BookingStatus currentStatus = booking.getStatus();
            
            if (currentStatus == Booking.BookingStatus.ACCEPTED || 
                currentStatus == Booking.BookingStatus.PENDING) {
                
                // Update booking status
                booking.setStatus(Booking.BookingStatus.CANCELLED);
                bookingDao.update(booking);
                
                // Only restore seats if the booking was ACCEPTED
                if (currentStatus == Booking.BookingStatus.ACCEPTED) {
                    Ride ride = booking.getRide();
                    ride.setAvailableSeats(ride.getAvailableSeats() + booking.getNumberOfSeats());
                    rideService.update(ride);
                    
                    System.out.println("Restored " + booking.getNumberOfSeats() + 
                                      " seats to ride ID: " + ride.getId());
                }
                
                System.out.println("Successfully cancelled booking ID: " + booking.getId());
            } else {
                throw new InvalidBookingStateException(
                    currentStatus.toString(), 
                    "ACCEPTED or PENDING"
                );
            }
        } catch (Exception e) {
            System.err.println("Error in cancelBooking: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public void completeBooking(Booking booking) {
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        bookingDao.update(booking);
    }
}
package com.example.carpool.services;

import com.example.carpool.model.Booking;
import com.example.carpool.model.Ride;
import com.example.carpool.model.User;

import java.util.List;
import java.util.Optional;

public interface BookingService {
    Optional<Booking> findById(Long id);
    List<Booking> findAll();
    List<Booking> findByRider(User rider);
    List<Booking> findByRide(Ride ride);
    List<Booking> findByStatus(Booking.BookingStatus status);
    List<Booking> findByRiderAndStatus(User rider, Booking.BookingStatus status);
    List<Booking> findByRideAndStatus(Ride ride, Booking.BookingStatus status);
    List<Booking> findPaidBookings();
    List<Booking> findUnpaidBookings();
    void save(Booking booking);
    void update(Booking booking);
    void delete(Booking booking);
    void deleteById(Long id);
    void updateBookingStatus(Booking booking, Booking.BookingStatus status);

    void cancelBooking(Booking booking);
    void completeBooking(Booking booking);
}
package com.example.carpool.dao;

import com.example.carpool.model.Booking;
import com.example.carpool.model.Ride;
import com.example.carpool.model.User;

import java.util.List;

public interface BookingDao extends BaseDao<Booking> {
    List<Booking> findByRider(User rider);
    List<Booking> findByRide(Ride ride);
    List<Booking> findByStatus(Booking.BookingStatus status);
    List<Booking> findByRiderAndStatus(User rider, Booking.BookingStatus status);
    List<Booking> findByRideAndStatus(Ride ride, Booking.BookingStatus status);
    List<Booking> findPaidBookings(); // Bookings with completed payments
    List<Booking> findUnpaidBookings(); // Bookings without completed payments
}
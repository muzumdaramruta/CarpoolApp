package com.example.carpool.dao;

import com.example.carpool.model.Booking;
import java.util.List;
import com.example.carpool.model.Payment;

import java.util.Optional;

public interface PaymentDao extends BaseDao<Payment> {
    Optional<Payment> findByBooking(Booking booking);
    Optional<Payment> findByStripePaymentId(String stripePaymentId);
    List<Payment> findByStatus(Payment.PaymentStatus status);
}
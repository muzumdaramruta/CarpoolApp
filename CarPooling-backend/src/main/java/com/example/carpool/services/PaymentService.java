package com.example.carpool.services;

import com.example.carpool.model.Booking;
import com.example.carpool.model.Payment;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PaymentService {
    Optional<Payment> findById(Long id);
    List<Payment> findAll();
    Optional<Payment> findByBooking(Booking booking);
    Optional<Payment> findByStripePaymentId(String stripePaymentId);
    List<Payment> findByStatus(Payment.PaymentStatus status);
    void save(Payment payment);
    void update(Payment payment);
    void delete(Payment payment);
    void deleteById(Long id);
    Payment processPayment(Booking booking, String paymentMethod, BigDecimal amount);
    Payment completePayment(String stripePaymentId);
    Payment refundPayment(Payment payment);
}

package com.example.carpool.services;

import com.example.carpool.dao.PaymentDao;
import com.example.carpool.model.Booking;
import com.example.carpool.model.Payment;
import com.example.carpool.model.Ride;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentDao paymentDao;

    @Autowired
    @Lazy
    private BookingService bookingService;

    @Autowired
    @Lazy
    private RideService rideService;

    @Value("${stripe.api.key:}")
    private String stripeApiKey;

    @Override
    @Transactional(readOnly = true)
    public Optional<Payment> findById(Long id) {
        return paymentDao.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> findAll() {
        return paymentDao.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Payment> findByBooking(Booking booking) {
        return paymentDao.findByBooking(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Payment> findByStripePaymentId(String stripePaymentId) {
        return paymentDao.findByStripePaymentId(stripePaymentId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Payment> findByStatus(Payment.PaymentStatus status) {
        return paymentDao.findByStatus(status);
    }

    @Override
    public void save(Payment payment) {
        paymentDao.save(payment);
    }

    @Override
    public void update(Payment payment) {
        paymentDao.update(payment);
    }

    @Override
    public void delete(Payment payment) {
        paymentDao.delete(payment);
    }

    @Override
    public void deleteById(Long id) {
        paymentDao.deleteById(id);
    }

    @Override
    public Payment processPayment(Booking booking, String paymentMethod, BigDecimal amount) {
        try {
            System.out.println("PaymentService.processPayment called for booking: " + booking.getId());
            
            // Validate inputs
            if (booking == null) {
                throw new IllegalArgumentException("Booking cannot be null");
            }
            if (booking.getRide() == null) {
                throw new IllegalArgumentException("Booking must have ride information");
            }
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Amount must be positive");
            }
            if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
                throw new IllegalArgumentException("Payment method cannot be empty");
            }
            
            // SIMPLIFIED: Allow payment for PENDING bookings (immediate payment)
            if (booking.getStatus() != Booking.BookingStatus.PENDING) {
                throw new IllegalArgumentException("Payment can only be processed for pending bookings. Current status: " + booking.getStatus());
            }
            
            // Check if payment already exists
            Optional<Payment> existingPayment = findByBooking(booking);
            if (existingPayment.isPresent()) {
                System.out.println("Payment already exists for booking: " + booking.getId());
                return existingPayment.get(); // Return existing payment
            }
            
            // Create new payment
            Payment payment = new Payment();
            payment.setBooking(booking);
            payment.setAmount(amount);
            payment.setCurrency("USD"); // Default currency
            payment.setPaymentMethod(paymentMethod);
            payment.setPaymentTime(LocalDateTime.now());
            payment.setStatus(Payment.PaymentStatus.PENDING);
            
            // Generate mock Stripe payment ID for demo
            String mockStripeId = "pi_" + System.currentTimeMillis() + "_" + booking.getId();
            payment.setStripePaymentId(mockStripeId);
            
            System.out.println("Creating payment with Stripe ID: " + mockStripeId);
            
            // Save payment
            paymentDao.save(payment);
            System.out.println("Payment saved successfully");
            
            // Set bidirectional relationship
            booking.setPayment(payment);
            bookingService.update(booking);
            System.out.println("Booking updated with payment reference");
            
            return payment;
            
        } catch (Exception e) {
            System.err.println("Error in processPayment: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to process payment: " + e.getMessage(), e);
        }
    }

    @Override
    public Payment completePayment(String stripePaymentId) {
        try {
            System.out.println("PaymentService.completePayment called for Stripe ID: " + stripePaymentId);
            
            Optional<Payment> paymentOpt = findByStripePaymentId(stripePaymentId);
            
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                System.out.println("Found payment with ID: " + payment.getId());
                
                payment.setStatus(Payment.PaymentStatus.COMPLETED);
                paymentDao.update(payment);
                System.out.println("Payment status updated to COMPLETED");
                
                // After payment completion, confirm the booking
                Booking booking = payment.getBooking();
                if (booking != null && booking.getStatus() == Booking.BookingStatus.PENDING) {
                    System.out.println("Confirming booking after payment completion");
                    
                    // Update booking status to ACCEPTED
                    booking.setStatus(Booking.BookingStatus.ACCEPTED);
                    bookingService.update(booking);
                    System.out.println("Booking status updated to ACCEPTED");
                    
                    // Update available seats on the ride
                    Ride ride = booking.getRide();
                    if (ride != null) {
                        int newAvailableSeats = ride.getAvailableSeats() - booking.getNumberOfSeats();
                        ride.setAvailableSeats(newAvailableSeats);
                        rideService.update(ride);
                        
                        System.out.println("Reduced available seats by " + booking.getNumberOfSeats() + 
                                          ". New available seats: " + newAvailableSeats);
                    }
                    
                    System.out.println("Booking confirmation completed successfully");
                }
                
                return payment;
            } else {
                System.out.println("No payment found for Stripe ID: " + stripePaymentId);
                return null;
            }
            
        } catch (Exception e) {
            System.err.println("Error in completePayment: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to complete payment: " + e.getMessage(), e);
        }
    }

    @Override
    public Payment refundPayment(Payment payment) {
        try {
            System.out.println("PaymentService.refundPayment called for payment: " + payment.getId());
            
            if (payment == null) {
                throw new IllegalArgumentException("Payment cannot be null");
            }
            
            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            paymentDao.update(payment);
            System.out.println("Payment status updated to REFUNDED");
            
            // Cancel the booking when refunded
            Booking booking = payment.getBooking();
            if (booking != null) {
                bookingService.cancelBooking(booking);
                System.out.println("Booking cancelled due to refund");
            }
            
            return payment;
        } catch (Exception e) {
            System.err.println("Error in refundPayment: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to refund payment: " + e.getMessage(), e);
        }
    }
}
package com.example.carpool.controllers;

import com.example.carpool.model.Booking;
import com.example.carpool.model.Payment;
import com.example.carpool.model.User;
import com.example.carpool.services.BookingService;
import com.example.carpool.services.PaymentService;
import com.example.carpool.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        List<Payment> payments = paymentService.findAll();
        return new ResponseEntity<>(payments, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        Optional<Payment> payment = paymentService.findById(id);
        return payment.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Payment> getPaymentByBookingId(@PathVariable Long bookingId) {
        Optional<Booking> booking = bookingService.findById(bookingId);
        
        if (booking.isPresent()) {
            Optional<Payment> payment = paymentService.findByBooking(booking.get());
            return payment.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Payment>> getPaymentsByStatus(@PathVariable Payment.PaymentStatus status) {
        List<Payment> payments = paymentService.findByStatus(status);
        return new ResponseEntity<>(payments, HttpStatus.OK);
    }

    // NEW: Get all refunded payments
    @GetMapping("/refunds")
    public ResponseEntity<List<Payment>> getAllRefunds() {
        try {
            List<Payment> refunds = paymentService.findByStatus(Payment.PaymentStatus.REFUNDED);
            System.out.println("Found " + refunds.size() + " refunded payments");
            return new ResponseEntity<>(refunds, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching refunds: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // NEW: Get refunds for a specific rider
    @GetMapping("/refunds/rider/{riderId}")
    public ResponseEntity<List<Payment>> getRefundsByRider(@PathVariable Long riderId) {
        try {
            Optional<User> rider = userService.findById(riderId);
            
            if (!rider.isPresent()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            // Get all bookings for this rider
            List<Booking> riderBookings = bookingService.findByRider(rider.get());
            
            // Filter for refunded payments
            List<Payment> refunds = riderBookings.stream()
                .filter(booking -> booking.getPayment() != null && 
                                 booking.getPayment().getStatus() == Payment.PaymentStatus.REFUNDED)
                .map(Booking::getPayment)
                .collect(Collectors.toList());
            
            System.out.println("Found " + refunds.size() + " refunds for rider ID: " + riderId);
            return new ResponseEntity<>(refunds, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error fetching rider refunds: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    

    @PostMapping("/booking/{bookingId}")
    public ResponseEntity<?> processPayment(
            @PathVariable Long bookingId,
            @RequestBody Map<String, Object> paymentDetails) {
        
        try {
            System.out.println("Processing payment for booking ID: " + bookingId);
            
            Optional<Booking> bookingOpt = bookingService.findById(bookingId);
            
            if (!bookingOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Booking not found");
                return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
            }
            
            Booking booking = bookingOpt.get();
            System.out.println("Found booking with status: " + booking.getStatus());
            
            // Check if booking has ride information
            if (booking.getRide() == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Booking is missing ride information");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            // FIXED: Allow payment for PENDING bookings (immediate payment flow)
            if (booking.getStatus() != Booking.BookingStatus.PENDING) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Payment can only be made for pending bookings. Current status: " + booking.getStatus());
                return new ResponseEntity<>(error, HttpStatus.CONFLICT);
            }
            
            // Check if payment already exists
            Optional<Payment> existingPayment = paymentService.findByBooking(booking);
            if (existingPayment.isPresent() && 
                existingPayment.get().getStatus() == Payment.PaymentStatus.COMPLETED) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Payment already completed for this booking");
                return new ResponseEntity<>(error, HttpStatus.CONFLICT);
            }
            
            String paymentMethod = (String) paymentDetails.get("paymentMethod");
            if (paymentMethod == null || paymentMethod.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Payment method is required");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            // Calculate amount
            BigDecimal fareAmount = booking.getRide().getFareAmount();
            if (fareAmount == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Ride fare amount is not set");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            BigDecimal totalAmount = fareAmount.multiply(BigDecimal.valueOf(booking.getNumberOfSeats()));
            System.out.println("Calculated total amount: " + totalAmount);
            
            // Process payment
            Payment payment = paymentService.processPayment(booking, paymentMethod, totalAmount);
            System.out.println("Payment created with ID: " + payment.getId());
            
            // For demo purposes, immediately complete the payment
            // In production, this would be handled by Stripe webhook
            if (payment != null) {
                payment.setStatus(Payment.PaymentStatus.COMPLETED);
                paymentService.update(payment);
                
                // Complete the payment which will trigger booking confirmation
                paymentService.completePayment(payment.getStripePaymentId());
                System.out.println("Payment completed and booking confirmed");
            }
            
            return new ResponseEntity<>(payment, HttpStatus.CREATED);
            
        } catch (Exception e) {
            System.err.println("Error processing payment: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/stripe/webhook")
    public ResponseEntity<Payment> handleStripeWebhook(@RequestBody Map<String, Object> event) {
        try {
            String eventType = (String) event.get("type");
            Map<String, Object> data = (Map<String, Object>) event.get("data");
            Map<String, Object> object = (Map<String, Object>) data.get("object");
            String paymentId = (String) object.get("id");
            
            if ("payment_intent.succeeded".equals(eventType)) {
                Payment payment = paymentService.completePayment(paymentId);
                
                if (payment != null) {
                    return new ResponseEntity<>(payment, HttpStatus.OK);
                } else {
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                }
            }
            
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<?> refundPayment(@PathVariable Long id) {
        try {
            System.out.println("Manual refund request for payment ID: " + id);
            
            Optional<Payment> paymentOpt = paymentService.findById(id);
            
            if (!paymentOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Payment not found");
                return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
            }
            
            Payment payment = paymentOpt.get();
            System.out.println("Current payment status: " + payment.getStatus());
            
            if (payment.getStatus() != Payment.PaymentStatus.COMPLETED) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Can only refund completed payments. Current status: " + payment.getStatus());
                return new ResponseEntity<>(error, HttpStatus.CONFLICT);
            }
            
            Payment refundedPayment = paymentService.refundPayment(payment);
            System.out.println("Refund processed successfully for payment ID: " + id);
            
            // Return success response with refund details
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Refund processed successfully");
            response.put("payment", refundedPayment);
            response.put("refundAmount", refundedPayment.getAmount());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error processing refund: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
package com.example.carpool.controllers;

import com.example.carpool.exception.BookingNotFoundException;
import com.example.carpool.exception.InvalidBookingStateException;
import com.example.carpool.model.Booking;
import com.example.carpool.model.Payment;
import com.example.carpool.model.Ride;
import com.example.carpool.model.User;
import com.example.carpool.services.BookingService;
import com.example.carpool.services.PaymentService;
import com.example.carpool.services.RideService;
import com.example.carpool.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    @Autowired
    private RideService rideService;

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingService.findAll();
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Optional<Booking> booking = bookingService.findById(id);
        return booking.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/rider/{riderId}")
    public ResponseEntity<List<Booking>> getBookingsByRiderId(@PathVariable Long riderId) {
        Optional<User> rider = userService.findById(riderId);
        
        if (rider.isPresent()) {
            List<Booking> bookings = bookingService.findByRider(rider.get());
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/ride/{rideId}")
    public ResponseEntity<List<Booking>> getBookingsByRideId(@PathVariable Long rideId) {
        Optional<Ride> ride = rideService.findById(rideId);
        
        if (ride.isPresent()) {
            List<Booking> bookings = bookingService.findByRide(ride.get());
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Booking>> getBookingsByStatus(@PathVariable Booking.BookingStatus status) {
        List<Booking> bookings = bookingService.findByStatus(status);
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }
    
    @GetMapping("/paid")
    public ResponseEntity<List<Booking>> getPaidBookings() {
        List<Booking> paidBookings = bookingService.findPaidBookings();
        return new ResponseEntity<>(paidBookings, HttpStatus.OK);
    }
    
    @GetMapping("/unpaid")
    public ResponseEntity<List<Booking>> getUnpaidBookings() {
        List<Booking> unpaidBookings = bookingService.findUnpaidBookings();
        return new ResponseEntity<>(unpaidBookings, HttpStatus.OK);
    }

    @PostMapping("/rider/{riderId}/ride/{rideId}")
    public ResponseEntity<Booking> createBooking(
            @PathVariable Long riderId,
            @PathVariable Long rideId,
            @RequestBody Booking booking) {
        
        Optional<User> rider = userService.findById(riderId);
        Optional<Ride> ride = rideService.findById(rideId);
        
        if (rider.isPresent() && ride.isPresent()) {
            // Check if ride has enough available seats
            if (ride.get().getAvailableSeats() < booking.getNumberOfSeats()) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }
            
            // Check if ride is scheduled
            if (ride.get().getStatus() != Ride.RideStatus.SCHEDULED) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }
            
            booking.setRider(rider.get());
            booking.setRide(ride.get());
            booking.setStatus(Booking.BookingStatus.PENDING);
            booking.setBookingTime(LocalDateTime.now());
            bookingService.save(booking);
            
            return new ResponseEntity<>(booking, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            System.out.println("Cancellation request received for booking ID: " + id);
            
            Optional<Booking> bookingOpt = bookingService.findById(id);
            
            if (!bookingOpt.isPresent()) {
                throw new BookingNotFoundException(id);
            }
            
            Booking booking = bookingOpt.get();
            System.out.println("Current booking status: " + booking.getStatus());
            
            // Check if booking can be cancelled
            if (booking.getStatus() != Booking.BookingStatus.ACCEPTED && 
                booking.getStatus() != Booking.BookingStatus.PENDING) {
                throw new InvalidBookingStateException(
                    booking.getStatus().toString(), 
                    "ACCEPTED or PENDING"
                );
            }

            // Check if there's a completed payment that needs refunding
            boolean needsRefund = false;
            Payment paymentToRefund = null;
            
            if (booking.getPayment() != null && 
                booking.getPayment().getStatus() == Payment.PaymentStatus.COMPLETED) {
                needsRefund = true;
                paymentToRefund = booking.getPayment();
                System.out.println("Payment found - will process refund for payment ID: " + paymentToRefund.getId());
            }
            
            // Cancel the booking (this will restore seats if booking was ACCEPTED)
            bookingService.cancelBooking(booking);
            System.out.println("Booking cancelled successfully");
            
            // Process refund if payment exists
            if (needsRefund && paymentToRefund != null) {
                try {
                    System.out.println("Processing refund for payment ID: " + paymentToRefund.getId());
                    
                    // The PaymentService.refundPayment() method will:
                    // 1. Set payment status to REFUNDED
                    // 2. Update the payment record
                    // Note: BookingService.cancelBooking() is already called above
                    paymentToRefund.setStatus(Payment.PaymentStatus.REFUNDED);
                    paymentService.update(paymentToRefund);
                    
                    System.out.println("Refund processed successfully");
                    
                    // Return success response with refund info
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Booking cancelled and refund processed successfully");
                    response.put("booking", booking);
                    response.put("refund", paymentToRefund);
                    
                    return ResponseEntity.ok(response);
                    
                } catch (Exception refundError) {
                    System.err.println("Error processing refund: " + refundError.getMessage());
                    refundError.printStackTrace();
                    
                    // Even if refund fails, booking is already cancelled
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Booking cancelled successfully, but refund processing failed. Please contact support.");
                    response.put("booking", booking);
                    response.put("refundError", refundError.getMessage());
                    
                    return ResponseEntity.ok(response);
                }
            } else {
                System.out.println("No payment to refund or payment not completed");
                
                // Return success response without refund
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Booking cancelled successfully");
                response.put("booking", booking);
                
                return ResponseEntity.ok(response);
            }
            
        } catch (BookingNotFoundException e) {
            throw e;
        } catch (InvalidBookingStateException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error cancelling booking " + id + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/{id}/confirm-payment")
    public ResponseEntity<?> confirmPaymentStatus(@PathVariable Long id) {
        try {
            System.out.println("Confirm payment request received for booking ID: " + id);
            
            Optional<Booking> bookingOpt = bookingService.findById(id);
            
            if (!bookingOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Booking not found");
                return ResponseEntity.status(404).body(error);
            }
            
            Booking booking = bookingOpt.get();
            System.out.println("Booking status: " + booking.getStatus());
            System.out.println("Payment exists: " + (booking.getPayment() != null));
            
            if (booking.getPayment() != null) {
                System.out.println("Payment status: " + booking.getPayment().getStatus());
            }
            
            // Check if payment exists and is completed
            if (booking.getPayment() != null && 
                booking.getPayment().getStatus() == Payment.PaymentStatus.COMPLETED &&
                booking.getStatus() == Booking.BookingStatus.PENDING) {
                
                System.out.println("Updating booking to ACCEPTED and reducing ride seats");
                
                // Update booking to ACCEPTED
                booking.setStatus(Booking.BookingStatus.ACCEPTED);
                bookingService.update(booking);
                
                // Update ride seats
                Ride ride = booking.getRide();
                if (ride != null) {
                    int newAvailableSeats = ride.getAvailableSeats() - booking.getNumberOfSeats();
                    ride.setAvailableSeats(newAvailableSeats);
                    rideService.update(ride);
                    
                    System.out.println("Reduced ride seats by " + booking.getNumberOfSeats() + 
                                      ". New available seats: " + newAvailableSeats);
                }
                
                System.out.println("Booking confirmation completed successfully");
                return ResponseEntity.ok(booking);
            }
            
            Map<String, String> error = new HashMap<>();
            if (booking.getPayment() == null) {
                error.put("error", "No payment found for this booking");
            } else if (booking.getPayment().getStatus() != Payment.PaymentStatus.COMPLETED) {
                error.put("error", "Payment is not completed. Status: " + booking.getPayment().getStatus());
            } else if (booking.getStatus() != Booking.BookingStatus.PENDING) {
                error.put("error", "Booking is not in pending status. Status: " + booking.getStatus());
            }
            
            return ResponseEntity.badRequest().body(error);
            
        } catch (Exception e) {
            System.err.println("Error confirming payment: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @PutMapping("/{id}/complete")
    public ResponseEntity<Booking> completeBooking(@PathVariable Long id) {
        Optional<Booking> booking = bookingService.findById(id);
        
        if (booking.isPresent()) {
            if (booking.get().getStatus() != Booking.BookingStatus.ACCEPTED) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }
            
            bookingService.completeBooking(booking.get());
            return new ResponseEntity<>(booking.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteBooking(@PathVariable Long id) {
        Optional<Booking> booking = bookingService.findById(id);
        
        if (booking.isPresent()) {
            // Only allow deletion for pending bookings
            if (booking.get().getStatus() == Booking.BookingStatus.PENDING) {
                bookingService.deleteById(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
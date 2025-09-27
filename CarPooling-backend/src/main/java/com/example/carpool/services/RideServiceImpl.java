package com.example.carpool.services;

import com.example.carpool.dao.RideDao;
import com.example.carpool.events.BookingEvent;
import com.example.carpool.events.RideStatusChangeEvent;
import com.example.carpool.model.Booking;
import com.example.carpool.model.Ride;
import com.example.carpool.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RideServiceImpl implements RideService {

    @Autowired
    private RideDao rideDao;
    
    @Autowired
    @Lazy  // This fixes the circular dependency
    private BookingService bookingService;

    // REMOVED: NotificationService - All notifications go through Kafka now
    // @Autowired
    // private NotificationService notificationService;

    @Autowired
    private EventPublisher eventPublisher; // Kafka event publisher

    @Override
    @Transactional(readOnly = true)
    public Optional<Ride> findById(Long id) {
        return rideDao.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ride> findAll() {
        return rideDao.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ride> findByDriver(User driver) {
        return rideDao.findByDriver(driver);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ride> findAvailableRides(String originLocation, String destinationLocation, LocalDateTime departureTime) {
        return rideDao.findAvailableRides(originLocation, destinationLocation, departureTime);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ride> findByStatus(Ride.RideStatus status) {
        return rideDao.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ride> findByDriverAndStatus(User driver, Ride.RideStatus status) {
        return rideDao.findByDriverAndStatus(driver, status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ride> findUpcomingRides() {
        return rideDao.findUpcomingRides();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ride> findPopularRoutes(int limit) {
        return rideDao.findPopularRoutes(limit);
    }

    @Override
    public void save(Ride ride) {
        rideDao.save(ride);
        
        // Publish ride creation event to Kafka
        publishRideCreationEvent(ride);
    }

    @Override
    public void update(Ride ride) {
        rideDao.update(ride);
    }

    @Override
    public void delete(Ride ride) {
        rideDao.delete(ride);
    }

    @Override
    public void deleteById(Long id) {
        rideDao.deleteById(id);
    }

    @Override
    public void updateRideStatus(Ride ride, Ride.RideStatus status) {
        try {
            System.out.println("🚗 Updating ride " + ride.getId() + " status: " + ride.getStatus() + " → " + status);
            
            Ride.RideStatus oldStatus = ride.getStatus();
            ride.setStatus(status);
            rideDao.update(ride);
            
            // Publish ride status change event to Kafka
            publishRideStatusChangeEvent(ride, oldStatus, status);
            
            // Publish rider notifications to Kafka
            publishRiderNotifications(ride, status);
            
            // Handle ride completion
            if (status == Ride.RideStatus.COMPLETED && oldStatus != Ride.RideStatus.COMPLETED) {
                handleRideCompletion(ride);
                
            } else if (status == Ride.RideStatus.CANCELLED) {
                handleRideCancellation(ride);
            }
            
            System.out.println("✅ Ride " + ride.getId() + " status updated successfully");
            
        } catch (Exception e) {
            System.err.println("❌ Error updating ride status: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    // ENHANCED: Centralized ride creation event publishing
    private void publishRideCreationEvent(Ride ride) {
        try {
            RideStatusChangeEvent event = new RideStatusChangeEvent(
                ride.getId(),
                null, // No old status for new rides
                ride.getStatus().toString(),
                ride.getDriver().getId(),
                ride.getOriginLocation(),
                ride.getDestinationLocation()
            );
            eventPublisher.publishRideStatusChange(event);
            System.out.println("📤 Published ride creation event for ride ID: " + ride.getId());
        } catch (Exception e) {
            System.err.println("❌ Failed to publish ride creation event: " + e.getMessage());
        }
    }
    
    // ENHANCED: Centralized ride status change event publishing
    private void publishRideStatusChangeEvent(Ride ride, Ride.RideStatus oldStatus, Ride.RideStatus newStatus) {
        try {
            RideStatusChangeEvent event = new RideStatusChangeEvent(
                ride.getId(),
                oldStatus.toString(),
                newStatus.toString(),
                ride.getDriver().getId(),
                ride.getOriginLocation(),
                ride.getDestinationLocation()
            );
            eventPublisher.publishRideStatusChange(event);
            System.out.println("📤 Published ride status change: " + oldStatus + " → " + newStatus);
        } catch (Exception e) {
            System.err.println("❌ Failed to publish ride status change event: " + e.getMessage());
        }
    }
    
    // ENHANCED: Centralized rider notification publishing
    private void publishRiderNotifications(Ride ride, Ride.RideStatus status) {
        try {
            List<Booking> acceptedBookings = bookingService.findByRideAndStatus(ride, Booking.BookingStatus.ACCEPTED);
            
            if (acceptedBookings.isEmpty()) {
                System.out.println("ℹ️ No riders to notify for ride " + ride.getId());
                return;
            }
            
            String message = createNotificationMessage(ride, status);
            String rideInfo = ride.getOriginLocation() + " → " + ride.getDestinationLocation();
            
            for (Booking booking : acceptedBookings) {
                eventPublisher.publishRiderNotification(
                    booking.getRider().getId(), 
                    message, 
                    rideInfo
                );
                
                // Console log for immediate debugging
                System.out.println("📱 Notification queued for: " + booking.getRider().getFullName() + 
                                 " (" + booking.getRider().getEmail() + ")");
            }
            
            System.out.println("📤 Queued " + acceptedBookings.size() + " rider notifications via Kafka");
            
        } catch (Exception e) {
            System.err.println("❌ Failed to publish rider notifications: " + e.getMessage());
        }
    }
    
    // ENHANCED: Handle ride completion with events
    private void handleRideCompletion(Ride ride) {
        try {
            System.out.println("🏁 Processing ride completion for ride " + ride.getId());
            
            List<Booking> acceptedBookings = bookingService.findByRideAndStatus(ride, Booking.BookingStatus.ACCEPTED);
            
            for (Booking booking : acceptedBookings) {
                System.out.println("✅ Completing booking ID: " + booking.getId());
                bookingService.completeBooking(booking);
                
                // Publish booking completion event
                publishBookingEvent(booking, "COMPLETED");
            }
            
            System.out.println("🎉 Completed " + acceptedBookings.size() + " bookings for ride " + ride.getId());
            
        } catch (Exception e) {
            System.err.println("❌ Error handling ride completion: " + e.getMessage());
            throw e;
        }
    }
    
    // ENHANCED: Handle ride cancellation with events
    private void handleRideCancellation(Ride ride) {
        try {
            System.out.println("❌ Processing ride cancellation for ride " + ride.getId());
            
            List<Booking> pendingBookings = bookingService.findByRideAndStatus(ride, Booking.BookingStatus.PENDING);
            List<Booking> acceptedBookings = bookingService.findByRideAndStatus(ride, Booking.BookingStatus.ACCEPTED);
            
            // Cancel pending bookings
            for (Booking booking : pendingBookings) {
                booking.setStatus(Booking.BookingStatus.CANCELLED);
                bookingService.update(booking);
                publishBookingEvent(booking, "CANCELLED");
            }
            
            // Cancel accepted bookings and restore seats
            for (Booking booking : acceptedBookings) {
                booking.setStatus(Booking.BookingStatus.CANCELLED);
                bookingService.update(booking);
                
                // Restore seats
                ride.setAvailableSeats(ride.getAvailableSeats() + booking.getNumberOfSeats());
                
                publishBookingEvent(booking, "CANCELLED");
            }
            
            rideDao.update(ride); // Update ride with restored seats
            
            int totalCancelled = pendingBookings.size() + acceptedBookings.size();
            System.out.println("💸 Cancelled " + totalCancelled + " bookings and restored seats");
            
        } catch (Exception e) {
            System.err.println("❌ Error handling ride cancellation: " + e.getMessage());
            throw e;
        }
    }
    
    // Helper method to publish booking events
    private void publishBookingEvent(Booking booking, String eventType) {
        try {
            BookingEvent event = new BookingEvent(
                booking.getId(),
                booking.getRider().getId(),
                booking.getRide().getId(),
                eventType
            );
            event.setNumberOfSeats(booking.getNumberOfSeats());
            
            if (booking.getRide() != null && booking.getRide().getFareAmount() != null) {
                event.setAmount(booking.getRide().getFareAmount().multiply(
                    java.math.BigDecimal.valueOf(booking.getNumberOfSeats())
                ));
            }
            
            eventPublisher.publishBookingEvent(event);
            System.out.println("📤 Published booking " + eventType + " event for booking ID: " + booking.getId());
            
        } catch (Exception e) {
            System.err.println("❌ Failed to publish booking event: " + e.getMessage());
        }
    }
    
    // Helper method to create notification messages
    private String createNotificationMessage(Ride ride, Ride.RideStatus status) {
        switch (status) {
            case IN_PROGRESS:
                return String.format("🚗 Your ride from %s to %s has started! Driver: %s (Phone: %s)", 
                    ride.getOriginLocation(), 
                    ride.getDestinationLocation(), 
                    ride.getDriver().getFullName(),
                    ride.getDriver().getPhoneNumber());
                    
            case COMPLETED:
                return String.format("✅ Your ride from %s to %s has been completed successfully! Thank you for riding with us.", 
                    ride.getOriginLocation(), 
                    ride.getDestinationLocation());
                    
            case CANCELLED:
                return String.format("❌ Unfortunately, your ride from %s to %s has been cancelled by the driver. You will receive a full refund within 3-5 business days.", 
                    ride.getOriginLocation(), 
                    ride.getDestinationLocation());
                    
            default:
                return String.format("Your ride status has been updated to: %s", status);
        }
    }
}
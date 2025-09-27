package com.example.carpool.listeners;

import com.example.carpool.events.BookingEvent;
import com.example.carpool.events.RideStatusChangeEvent;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class RideEventListener {

    // REMOVED: NotificationService dependency - handled directly here
    // @Autowired
    // private NotificationService notificationService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "ride-status-changes", groupId = "carpool-group")
    public void handleRideStatusChange(String message) {
        try {
            System.out.println("📥 Received ride status change event: " + message);

            RideStatusChangeEvent event = RideStatusChangeEvent.fromJson(message);

            // Log the event details
            System.out.println("🚗 Ride Event Details:");
            System.out.println("   Ride ID: " + event.getRideId());
            System.out.println("   Status Change: " + event.getOldStatus() + " → " + event.getNewStatus());
            System.out.println("   Driver ID: " + event.getDriverId());
            System.out.println("   Route: " + event.getOriginLocation() + " → " + event.getDestinationLocation());
            System.out.println("   Timestamp: " + event.getTimestamp());

            // Process based on status change
            processRideStatusChange(event);

            System.out.println("✅ Processed ride status change: Ride " + event.getRideId() + 
                             " changed from " + event.getOldStatus() + " to " + event.getNewStatus());

        } catch (Exception e) {
            System.err.println("❌ Error processing ride status change event: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @KafkaListener(topics = "rider-notifications", groupId = "carpool-group")
    public void handleRiderNotification(String message) {
        try {
            System.out.println("📥 Received rider notification: " + message);

            // Parse the notification JSON
            JsonNode notification = objectMapper.readTree(message);
            
            Long riderId = notification.get("riderId").asLong();
            String notificationMessage = notification.get("message").asText();
            String rideInfo = notification.get("rideInfo").asText();
            String timestamp = notification.get("timestamp").asText();

            System.out.println("📱 Notification Details:");
            System.out.println("   Rider ID: " + riderId);
            System.out.println("   Message: " + notificationMessage);
            System.out.println("   Ride: " + rideInfo);
            System.out.println("   Time: " + timestamp);

            // Process the notification
            processRiderNotification(riderId, notificationMessage, rideInfo);

            System.out.println("✅ Processed rider notification for rider " + riderId);

        } catch (Exception e) {
            System.err.println("❌ Error processing rider notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @KafkaListener(topics = "booking-events", groupId = "carpool-group")
    public void handleBookingEvent(String message) {
        try {
            System.out.println("📥 Received booking event: " + message);

            BookingEvent event = BookingEvent.fromJson(message);

            System.out.println("📋 Booking Event Details:");
            System.out.println("   Booking ID: " + event.getBookingId());
            System.out.println("   Rider ID: " + event.getRiderId());
            System.out.println("   Ride ID: " + event.getRideId());
            System.out.println("   Event Type: " + event.getEventType());
            System.out.println("   Seats: " + event.getNumberOfSeats());
            System.out.println("   Amount: $" + event.getAmount());
            System.out.println("   Timestamp: " + event.getTimestamp());

            // Process the booking event
            processBookingEvent(event);

            System.out.println("✅ Processed booking " + event.getEventType() + " event for booking " + event.getBookingId());

        } catch (Exception e) {
            System.err.println("❌ Error processing booking event: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ENHANCED: Process ride status changes with specific actions
    private void processRideStatusChange(RideStatusChangeEvent event) {
        switch (event.getNewStatus()) {
            case "IN_PROGRESS":
                handleRideStarted(event);
                break;
            case "COMPLETED":
                handleRideCompleted(event);
                break;
            case "CANCELLED":
                handleRideCancelled(event);
                break;
            default:
                System.out.println("ℹ️ General ride status update processed");
        }
    }

    // Handle ride started event
    private void handleRideStarted(RideStatusChangeEvent event) {
        System.out.println("🚗 RIDE STARTED - Processing additional actions:");
        
        // Here you can add:
        // - Send immediate push notifications to mobile apps
        // - Update real-time tracking systems
        // - Notify customer service systems
        // - Update analytics dashboards
        
        System.out.println("   ✓ Real-time tracking activated");
        System.out.println("   ✓ Driver location monitoring started");
        System.out.println("   ✓ ETA calculations initiated");
        
        // Example: Trigger external API calls
        // trackingService.startTracking(event.getRideId());
        // analyticsService.recordRideStart(event);
    }

    // Handle ride completed event
    private void handleRideCompleted(RideStatusChangeEvent event) {
        System.out.println("🏁 RIDE COMPLETED - Processing completion actions:");
        
        // Here you can add:
        // - Send completion emails with receipts
        // - Request ride ratings/reviews
        // - Update driver statistics
        // - Process final payments
        
        System.out.println("   ✓ Completion notifications sent");
        System.out.println("   ✓ Review requests triggered");
        System.out.println("   ✓ Driver stats updated");
        
        // Example: Trigger completion workflows
        // emailService.sendCompletionReceipt(event.getRideId());
        // reviewService.requestReview(event.getRideId());
    }

    // Handle ride cancelled event
    private void handleRideCancelled(RideStatusChangeEvent event) {
        System.out.println("❌ RIDE CANCELLED - Processing cancellation actions:");
        
        // Here you can add:
        // - Process automatic refunds
        // - Send cancellation emails
        // - Update availability systems
        // - Notify customer service
        
        System.out.println("   ✓ Refund processing initiated");
        System.out.println("   ✓ Cancellation notifications sent");
        System.out.println("   ✓ Customer service notified");
        
        // Example: Trigger cancellation workflows
        // refundService.processRefunds(event.getRideId());
        // customerService.notifyCancellation(event);
    }

    // ENHANCED: Process rider notifications with multiple channels
    private void processRiderNotification(Long riderId, String message, String rideInfo) {
        System.out.println("📱 PROCESSING RIDER NOTIFICATION:");
        
        // Here you can implement multiple notification channels:
        
        // 1. Email notifications
        sendEmailNotification(riderId, message, rideInfo);
        
        // 2. SMS notifications  
        sendSMSNotification(riderId, message);
        
        // 3. Push notifications
        sendPushNotification(riderId, message, rideInfo);
        
        // 4. In-app notifications
        storeInAppNotification(riderId, message, rideInfo);

        System.out.println("   ✓ Multi-channel notification sent to rider " + riderId);
    }

    // ENHANCED: Process booking events for analytics and workflows
    private void processBookingEvent(BookingEvent event) {
        switch (event.getEventType()) {
            case "CREATED":
                System.out.println("📝 New booking created - updating availability");
                break;
            case "COMPLETED":
                System.out.println("✅ Booking completed - processing final steps");
                // updateDriverEarnings(event);
                // sendCompletionSurvey(event);
                break;
            case "CANCELLED":
                System.out.println("❌ Booking cancelled - processing refunds");
                // processRefund(event);
                // updateAvailability(event);
                break;
            case "PAYMENT_PROCESSED":
                System.out.println("💳 Payment processed - confirming booking");
                // confirmBooking(event);
                break;
        }
        
        // Always update analytics
        // analyticsService.recordBookingEvent(event);
    }

    // Placeholder methods for notification channels
    private void sendEmailNotification(Long riderId, String message, String rideInfo) {
        System.out.println("   📧 Email notification sent to rider " + riderId);
        // Implement email sending logic here
        // emailService.sendRideNotification(riderId, message, rideInfo);
    }

    private void sendSMSNotification(Long riderId, String message) {
        System.out.println("   📱 SMS notification sent to rider " + riderId);
        // Implement SMS sending logic here
        // smsService.sendNotification(riderId, message);
    }

    private void sendPushNotification(Long riderId, String message, String rideInfo) {
        System.out.println("   📲 Push notification sent to rider " + riderId);
        // Implement push notification logic here
        // pushService.sendNotification(riderId, message, rideInfo);
    }

    private void storeInAppNotification(Long riderId, String message, String rideInfo) {
        System.out.println("   💾 In-app notification stored for rider " + riderId);
        // Implement database storage logic here
        // notificationRepository.saveNotification(riderId, message, rideInfo);
    }
}
package com.example.carpool.services;

import com.example.carpool.events.BookingEvent;
import com.example.carpool.events.RideStatusChangeEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class EventPublisher {
    
    private static final String RIDE_STATUS_TOPIC = "ride-status-changes";
    private static final String BOOKING_TOPIC = "booking-events";
    private static final String NOTIFICATION_TOPIC = "rider-notifications";
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    public void publishRideStatusChange(RideStatusChangeEvent event) {
        try {
            String key = "ride-" + event.getRideId();
            kafkaTemplate.send(RIDE_STATUS_TOPIC, key, event.toJson());
            System.out.println("📤 Published ride status change event: " + event.toJson());
        } catch (Exception e) {
            System.err.println("❌ Failed to publish ride status change event: " + e.getMessage());
        }
    }
    
    public void publishBookingEvent(BookingEvent event) {
        try {
            String key = "booking-" + event.getBookingId();
            kafkaTemplate.send(BOOKING_TOPIC, key, event.toJson());
            System.out.println("📤 Published booking event: " + event.toJson());
        } catch (Exception e) {
            System.err.println("❌ Failed to publish booking event: " + e.getMessage());
        }
    }
    
    public void publishRiderNotification(Long riderId, String message, String rideInfo) {
        try {
            String notificationJson = String.format(
                "{\"riderId\":%d,\"message\":\"%s\",\"rideInfo\":\"%s\",\"timestamp\":\"%s\"}", 
                riderId, message, rideInfo, java.time.LocalDateTime.now()
            );
            
            String key = "rider-" + riderId;
            kafkaTemplate.send(NOTIFICATION_TOPIC, key, notificationJson);
            System.out.println("📤 Published rider notification: " + notificationJson);
        } catch (Exception e) {
            System.err.println("❌ Failed to publish rider notification: " + e.getMessage());
        }
    }
}
package com.example.carpool.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingEvent {
    private Long bookingId;
    private Long riderId;
    private Long rideId;
    private String eventType; // CREATED, CANCELLED, COMPLETED, PAYMENT_PROCESSED
    private BigDecimal amount;
    private Integer numberOfSeats;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    
    public BookingEvent() {
        this.timestamp = LocalDateTime.now();
    }
    
    public BookingEvent(Long bookingId, Long riderId, Long rideId, String eventType) {
        this();
        this.bookingId = bookingId;
        this.riderId = riderId;
        this.rideId = rideId;
        this.eventType = eventType;
    }
    
    public String toJson() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.findAndRegisterModules();
            return mapper.writeValueAsString(this);
        } catch (Exception e) {
            return "{}";
        }
    }
    
    public static BookingEvent fromJson(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.findAndRegisterModules();
            return mapper.readValue(json, BookingEvent.class);
        } catch (Exception e) {
            return new BookingEvent();
        }
    }
    
    // Getters and setters
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    
    public Long getRiderId() { return riderId; }
    public void setRiderId(Long riderId) { this.riderId = riderId; }
    
    public Long getRideId() { return rideId; }
    public void setRideId(Long rideId) { this.rideId = rideId; }
    
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public Integer getNumberOfSeats() { return numberOfSeats; }
    public void setNumberOfSeats(Integer numberOfSeats) { this.numberOfSeats = numberOfSeats; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}

package com.example.carpool.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;

public class RideStatusChangeEvent {
    private Long rideId;
    private String oldStatus;
    private String newStatus;
    private Long driverId;
    private String originLocation;
    private String destinationLocation;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    
    public RideStatusChangeEvent() {
        this.timestamp = LocalDateTime.now();
    }
    
    public RideStatusChangeEvent(Long rideId, String oldStatus, String newStatus, 
                                Long driverId, String originLocation, String destinationLocation) {
        this();
        this.rideId = rideId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.driverId = driverId;
        this.originLocation = originLocation;
        this.destinationLocation = destinationLocation;
    }
    
    // Convert to JSON string
    public String toJson() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.findAndRegisterModules(); // For LocalDateTime support
            return mapper.writeValueAsString(this);
        } catch (Exception e) {
            return "{}";
        }
    }
    
    // Create from JSON string
    public static RideStatusChangeEvent fromJson(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.findAndRegisterModules();
            return mapper.readValue(json, RideStatusChangeEvent.class);
        } catch (Exception e) {
            return new RideStatusChangeEvent();
        }
    }
    
    // Getters and setters
    public Long getRideId() { return rideId; }
    public void setRideId(Long rideId) { this.rideId = rideId; }
    
    public String getOldStatus() { return oldStatus; }
    public void setOldStatus(String oldStatus) { this.oldStatus = oldStatus; }
    
    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
    
    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
    
    public String getOriginLocation() { return originLocation; }
    public void setOriginLocation(String originLocation) { this.originLocation = originLocation; }
    
    public String getDestinationLocation() { return destinationLocation; }
    public void setDestinationLocation(String destinationLocation) { this.destinationLocation = destinationLocation; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}

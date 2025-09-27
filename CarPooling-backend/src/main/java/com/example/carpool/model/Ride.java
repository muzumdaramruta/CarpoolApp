package com.example.carpool.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "rides")
public class Ride {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Enum for ride status - defined only once
    public enum RideStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    }
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RideStatus status;
    
    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;
    
    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
    
    @Column(nullable = false)
    private String originLocation;
    
    @Column(nullable = false)
    private String destinationLocation;
    
    @Column(nullable = false)
    private LocalDateTime departureTime;
    
    @Column
    private Integer availableSeats;
    
    @Column(nullable = false)
    private BigDecimal fareAmount;
    
    @OneToMany(mappedBy = "ride", cascade = CascadeType.ALL)
    @JsonIgnore  // This prevents infinite recursion
    private Set<Booking> bookings = new HashSet<>();
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getDriver() {
        return driver;
    }
    
    public void setDriver(User driver) {
        this.driver = driver;
    }
    
    public Vehicle getVehicle() {
        return vehicle;
    }
    
    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }
    
    public String getOriginLocation() {
        return originLocation;
    }
    
    public void setOriginLocation(String originLocation) {
        this.originLocation = originLocation;
    }
    
    public String getDestinationLocation() {
        return destinationLocation;
    }
    
    public void setDestinationLocation(String destinationLocation) {
        this.destinationLocation = destinationLocation;
    }
    
    public LocalDateTime getDepartureTime() {
        return departureTime;
    }
    
    public void setDepartureTime(LocalDateTime departureTime) {
        this.departureTime = departureTime;
    }
    
    public Integer getAvailableSeats() {
        return availableSeats;
    }
    
    public void setAvailableSeats(Integer availableSeats) {
        this.availableSeats = availableSeats;
    }
    
    public BigDecimal getFareAmount() {
        return fareAmount;
    }
    
    public void setFareAmount(BigDecimal fareAmount) {
        this.fareAmount = fareAmount;
    }
    
    public Set<Booking> getBookings() {
        return bookings;
    }
    
    public void setBookings(Set<Booking> bookings) {
        this.bookings = bookings;
    }
    
    public RideStatus getStatus() {
        return status;
    }
    
    public void setStatus(RideStatus status) {
        this.status = status;
    }
}
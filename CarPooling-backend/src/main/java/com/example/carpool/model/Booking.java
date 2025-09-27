package com.example.carpool.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "ride_id", nullable = false)
    private Ride ride;
    
    @ManyToOne
    @JoinColumn(name = "rider_id", nullable = false)
    private User rider;
    
    @Column(nullable = false)
    private Integer numberOfSeats;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;
    
    @Column
    private LocalDateTime bookingTime;
    
    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Payment payment;
    
    // Enum for booking status
    public enum BookingStatus {
        PENDING, ACCEPTED, REJECTED, CANCELLED, COMPLETED
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Ride getRide() {
        return ride;
    }
    public void setRide(Ride ride) {
        this.ride = ride;
    }
    public User getRider() {
        return rider;
    }
    public void setRider(User rider) {
        this.rider = rider;
    }
    public Integer getNumberOfSeats() {
        return numberOfSeats;
    }
    public void setNumberOfSeats(Integer numberOfSeats) {
        this.numberOfSeats = numberOfSeats;
    }
    public BookingStatus getStatus() {
        return status;
    }
    public void setStatus(BookingStatus status) {
        this.status = status;
    }
    public LocalDateTime getBookingTime() {
        return bookingTime;
    }
    public void setBookingTime(LocalDateTime bookingTime) {
        this.bookingTime = bookingTime;
    }
    public Payment getPayment() {
        return payment;
    }
    public void setPayment(Payment payment) {
        this.payment = payment;
    }
}
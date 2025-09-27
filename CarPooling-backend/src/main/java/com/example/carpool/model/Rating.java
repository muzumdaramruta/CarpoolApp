package com.example.carpool.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ratings")
public class Rating {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;
    
    @ManyToOne
    @JoinColumn(name = "rider_id", nullable = false)
    private User rider;
    
    @ManyToOne
    @JoinColumn(name = "ride_id", nullable = false)
    private Ride ride;
    
    @Column(nullable = false)
    private Integer rating; // 1-5 stars
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public Rating() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Rating(User driver, User rider, Ride ride, Integer rating, String comment) {
        this();
        this.driver = driver;
        this.rider = rider;
        this.ride = ride;
        this.rating = rating;
        this.comment = comment;
    }
    
    // Getters and Setters
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
    
    public User getRider() {
        return rider;
    }
    
    public void setRider(User rider) {
        this.rider = rider;
    }
    
    public Ride getRide() {
        return ride;
    }
    
    public void setRide(Ride ride) {
        this.ride = ride;
    }
    
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
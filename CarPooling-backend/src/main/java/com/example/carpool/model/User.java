package com.example.carpool.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false)
    @JsonIgnore  // Never expose passwords in JSON
    private String password;
    
    @Column(nullable = false)
    private String fullName;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String phoneNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.RIDER; // Default role
    
    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL)
    @JsonIgnore  // Prevent infinite recursion
    private Set<Ride> driverRides = new HashSet<>();
    
    @OneToMany(mappedBy = "rider", cascade = CascadeType.ALL)
    @JsonIgnore  // Prevent infinite recursion
    private Set<Booking> bookings = new HashSet<>();
    
    // Enum for user roles
    public enum UserRole {
        DRIVER, RIDER
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getFullName() {
        return fullName;
    }
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPhoneNumber() {
        return phoneNumber;
    }
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    public UserRole getRole() {
        return role;
    }
    public void setRole(UserRole role) {
        this.role = role;
    }
    public Set<Ride> getDriverRides() {
        return driverRides;
    }
    public void setDriverRides(Set<Ride> driverRides) {
        this.driverRides = driverRides;
    }
    public Set<Booking> getBookings() {
        return bookings;
    }
    public void setBookings(Set<Booking> bookings) {
        this.bookings = bookings;
    }
    
    
    @Column(name = "profile_image_url")
    private String profileImageUrl;

    // Getter and setter
    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
}
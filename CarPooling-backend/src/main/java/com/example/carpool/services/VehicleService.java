package com.example.carpool.services;

import com.example.carpool.model.User;
import com.example.carpool.model.Vehicle;

import java.util.List;
import java.util.Optional;

public interface VehicleService {
    Optional<Vehicle> findById(Long id);
    List<Vehicle> findAll();
    List<Vehicle> findByOwner(User owner);
    void save(Vehicle vehicle);
    void update(Vehicle vehicle);
    void delete(Vehicle vehicle);
    void deleteById(Long id);
}
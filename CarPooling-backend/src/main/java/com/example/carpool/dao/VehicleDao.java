package com.example.carpool.dao;

import com.example.carpool.model.User;
import com.example.carpool.model.Vehicle;

import java.util.List;

public interface VehicleDao extends BaseDao<Vehicle> {
    List<Vehicle> findByOwner(User owner);
}
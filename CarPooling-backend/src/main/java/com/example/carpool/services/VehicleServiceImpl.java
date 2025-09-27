package com.example.carpool.services;

import com.example.carpool.dao.VehicleDao;
import com.example.carpool.dao.RideDao;
import com.example.carpool.model.User;
import com.example.carpool.model.Vehicle;
import com.example.carpool.model.Ride;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class VehicleServiceImpl implements VehicleService {
    @Autowired
    private VehicleDao vehicleDao;
    
    @Autowired
    private RideDao rideDao;
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Vehicle> findById(Long id) {
        return vehicleDao.findById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> findAll() {
        return vehicleDao.findAll();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> findByOwner(User owner) {
        return vehicleDao.findByOwner(owner);
    }
    
    @Override
    public void save(Vehicle vehicle) {
        vehicleDao.save(vehicle);
    }
    
    @Override
    public void update(Vehicle vehicle) {
        vehicleDao.update(vehicle);
    }
    
    @Override
    public void delete(Vehicle vehicle) {
        vehicleDao.delete(vehicle);
    }
    
    @Override
    @Transactional
    public void deleteById(Long id) {
        // First delete all associated rides (completed or cancelled)
        List<Ride> rides = rideDao.findRidesByVehicleId(id);
        for (Ride ride : rides) {
            rideDao.delete(ride);
        }
        
        // Now delete the vehicle
        vehicleDao.deleteById(id);
    }
}
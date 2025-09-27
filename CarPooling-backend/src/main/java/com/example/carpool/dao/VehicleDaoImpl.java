package com.example.carpool.dao;

import com.example.carpool.model.User;
import com.example.carpool.model.Vehicle;
import org.springframework.stereotype.Repository;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import java.util.List;

@Repository
public class VehicleDaoImpl extends BaseDaoImpl<Vehicle> implements VehicleDao {

    @Override
    public List<Vehicle> findByOwner(User owner) {
        CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
        CriteriaQuery<Vehicle> cq = cb.createQuery(Vehicle.class);
        Root<Vehicle> root = cq.from(Vehicle.class);
        cq.select(root).where(cb.equal(root.get("owner"), owner));
        return getCurrentSession().createQuery(cq).getResultList();
    }
}
package com.example.carpool.dao;

import com.example.carpool.model.Ride;
import com.example.carpool.model.User;

import org.hibernate.Session;
import org.hibernate.query.NativeQuery;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.Query;
import jakarta.persistence.criteria.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class RideDaoImpl extends BaseDaoImpl<Ride> implements RideDao {

    @Override
    public List<Ride> findByDriver(User driver) {
        CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
        CriteriaQuery<Ride> cq = cb.createQuery(Ride.class);
        Root<Ride> root = cq.from(Ride.class);
        cq.select(root).where(cb.equal(root.get("driver"), driver));
        return getCurrentSession().createQuery(cq).getResultList();
    }

    @Override
    public List<Ride> findAvailableRides(String originLocation, String destinationLocation, LocalDateTime departureTime) {
        // Get current session from entity manager
        Session session = getCurrentSession();
        
        // Debug logging
        System.out.println("=========== HIBERNATE DEBUG =============");
        System.out.println("Search parameters:");
        System.out.println("Origin: " + originLocation);
        System.out.println("Destination: " + destinationLocation);
        System.out.println("Date: " + departureTime.toLocalDate());
        
        try {
            // Try with a native SQL query to directly match the date part
            String nativeSql = "SELECT * FROM rides " +
                         "WHERE status = 'SCHEDULED' " +
                         "AND available_seats > 0 " +
                         "AND DATE(departure_time) = :searchDate";
            
            NativeQuery<Ride> nativeQuery = session.createNativeQuery(nativeSql, Ride.class)
                    .setParameter("searchDate", departureTime.toLocalDate().toString());
            
            List<Ride> directResults = nativeQuery.getResultList();
            System.out.println("Direct SQL found " + directResults.size() + " rides");
            
            if (!directResults.isEmpty()) {
                return directResults;
            }
            
            // Fall back to HQL if native query doesn't work
            System.out.println("Trying with HQL query...");
            String hql = "FROM Ride r WHERE " +
                        "LOWER(r.originLocation) LIKE :origin AND " +
                        "LOWER(r.destinationLocation) LIKE :destination AND " +
                        "DATE(r.departureTime) = :departureDate AND " +
                        "r.availableSeats > 0 AND " +
                        "r.status = :status";
            
            org.hibernate.query.Query<Ride> query = session.createQuery(hql, Ride.class)
                    .setParameter("origin", "%" + originLocation.toLowerCase() + "%")
                    .setParameter("destination", "%" + destinationLocation.toLowerCase() + "%")
                    .setParameter("departureDate", departureTime.toLocalDate())
                    .setParameter("status", Ride.RideStatus.SCHEDULED);
            
            List<Ride> results = query.getResultList();
            System.out.println("HQL query found " + results.size() + " rides");
            
            return results;
        } catch (Exception e) {
            System.err.println("Error in direct query approach: " + e.getMessage());
            e.printStackTrace();
            
            // Fall back to the original approach if direct queries fail
            System.out.println("Falling back to criteria API...");
            
            CriteriaBuilder cb = session.getCriteriaBuilder();
            CriteriaQuery<Ride> cq = cb.createQuery(Ride.class);
            Root<Ride> root = cq.from(Ride.class);

            List<Predicate> predicates = new ArrayList<>();

            // Case-insensitive, containment-based search
            if (originLocation != null && !originLocation.trim().isEmpty()) {
                predicates.add(cb.like(
                    cb.lower(root.get("originLocation")),
                    "%" + originLocation.toLowerCase().trim() + "%"
                ));
            }

            if (destinationLocation != null && !destinationLocation.trim().isEmpty()) {
                predicates.add(cb.like(
                    cb.lower(root.get("destinationLocation")),
                    "%" + destinationLocation.toLowerCase().trim() + "%"
                ));
            }

            // Match just the date part using Hibernate functions for date extraction
            if (departureTime != null) {
                Expression<LocalDate> departureDate = cb.function(
                    "DATE", LocalDate.class, root.get("departureTime"));
                predicates.add(cb.equal(departureDate, departureTime.toLocalDate()));
            }

            // Only include rides with available seats and scheduled status
            predicates.add(cb.greaterThan(root.get("availableSeats"), 0));
            predicates.add(cb.equal(root.get("status"), Ride.RideStatus.SCHEDULED));

            cq.select(root).where(predicates.toArray(new Predicate[0]));
            cq.orderBy(cb.asc(root.get("departureTime")));

            return session.createQuery(cq).getResultList();
        }
    }

    @Override
    public List<Ride> findByStatus(Ride.RideStatus status) {
        CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
        CriteriaQuery<Ride> cq = cb.createQuery(Ride.class);
        Root<Ride> root = cq.from(Ride.class);
        cq.select(root).where(cb.equal(root.get("status"), status));
        return getCurrentSession().createQuery(cq).getResultList();
    }
    
    @Override
    public List<Ride> findByDriverAndStatus(User driver, Ride.RideStatus status) {
        CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
        CriteriaQuery<Ride> cq = cb.createQuery(Ride.class);
        Root<Ride> root = cq.from(Ride.class);
        
        Predicate driverPredicate = cb.equal(root.get("driver"), driver);
        Predicate statusPredicate = cb.equal(root.get("status"), status);
        
        cq.select(root).where(cb.and(driverPredicate, statusPredicate));
        return getCurrentSession().createQuery(cq).getResultList();
    }
    
    @Override
    public List<Ride> findUpcomingRides() {
        CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
        CriteriaQuery<Ride> cq = cb.createQuery(Ride.class);
        Root<Ride> root = cq.from(Ride.class);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneWeekFromNow = now.plusDays(7);
        
        Predicate statusPredicate = cb.equal(root.get("status"), Ride.RideStatus.SCHEDULED);
        Predicate timePredicate = cb.between(root.get("departureTime"), now, oneWeekFromNow);
        
        cq.select(root)
          .where(cb.and(statusPredicate, timePredicate))
          .orderBy(cb.asc(root.get("departureTime")));
          
        return getCurrentSession().createQuery(cq).getResultList();
    }
    
    @Override
    public List<Ride> findPopularRoutes(int limit) {
        // This is complex and best done with a native SQL query
        String sql = "SELECT r.origin_location, r.destination_location, COUNT(*) as ride_count " +
                    "FROM rides r " +
                    "JOIN bookings b ON r.id = b.ride_id " +
                    "WHERE b.status IN ('ACCEPTED', 'COMPLETED') " +
                    "GROUP BY r.origin_location, r.destination_location " +
                    "ORDER BY ride_count DESC " +
                    "LIMIT :limit";
                    
        @SuppressWarnings("unchecked")
        List<Object[]> results = getCurrentSession()
            .createNativeQuery(sql)
            .setParameter("limit", limit)
            .getResultList();
            
        // Convert the results to Ride objects or a specialized DTO
        // For simplicity, we'll just return all rides that match these routes
        if (results.isEmpty()) {
            return new ArrayList<>();
        }
        
        CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
        CriteriaQuery<Ride> cq = cb.createQuery(Ride.class);
        Root<Ride> root = cq.from(Ride.class);
        
        List<Predicate> orPredicates = new ArrayList<>();
        
        for (Object[] result : results) {
            String origin = (String) result[0];
            String destination = (String) result[1];
            
            Predicate originPredicate = cb.equal(root.get("originLocation"), origin);
            Predicate destinationPredicate = cb.equal(root.get("destinationLocation"), destination);
            
            orPredicates.add(cb.and(originPredicate, destinationPredicate));
        }
        
        cq.select(root).where(cb.or(orPredicates.toArray(new Predicate[0])));
        return getCurrentSession().createQuery(cq).getResultList();
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countActiveRidesByVehicleId(Long vehicleId) {
        CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
        CriteriaQuery<Long> cq = cb.createQuery(Long.class);
        Root<Ride> root = cq.from(Ride.class);
        
        // Create a predicate for active rides (not COMPLETED or CANCELLED)
        Predicate vehiclePredicate = cb.equal(root.get("vehicle").get("id"), vehicleId);
        Predicate statusPredicate = cb.and(
            cb.notEqual(root.get("status"), Ride.RideStatus.COMPLETED),
            cb.notEqual(root.get("status"), Ride.RideStatus.CANCELLED)
        );
        
        cq.select(cb.count(root))
          .where(cb.and(vehiclePredicate, statusPredicate));
        
        return getCurrentSession().createQuery(cq).getSingleResult();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Ride> findRidesByVehicleId(Long vehicleId) {
        CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
        CriteriaQuery<Ride> cq = cb.createQuery(Ride.class);
        Root<Ride> root = cq.from(Ride.class);
        
        cq.select(root)
          .where(cb.equal(root.get("vehicle").get("id"), vehicleId));
        
        return getCurrentSession().createQuery(cq).getResultList();
    }
}

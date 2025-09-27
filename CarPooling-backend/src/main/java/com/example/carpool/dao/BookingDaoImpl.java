package com.example.carpool.dao;

import com.example.carpool.model.Booking;
import com.example.carpool.model.Payment;
import com.example.carpool.model.Ride;
import com.example.carpool.model.User;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Repository;

import jakarta.persistence.criteria.*;
import java.util.List;
import java.util.Optional;

@Repository
public class BookingDaoImpl extends BaseDaoImpl<Booking> implements BookingDao {

    @Override
    public Optional<Booking> findById(Long id) {
        try {
            // Use simple find first
            Optional<Booking> bookingOpt = super.findById(id);
            
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                
                // Force initialization of lazy-loaded associations
                if (booking.getRide() != null) {
                    Hibernate.initialize(booking.getRide());
                    if (booking.getRide().getDriver() != null) {
                        Hibernate.initialize(booking.getRide().getDriver());
                    }
                }
                if (booking.getRider() != null) {
                    Hibernate.initialize(booking.getRider());
                }
                
                System.out.println("Successfully loaded booking with ID: " + id);
                System.out.println("Ride loaded: " + (booking.getRide() != null));
                if (booking.getRide() != null) {
                    System.out.println("Ride ID: " + booking.getRide().getId());
                    System.out.println("Ride fare: " + booking.getRide().getFareAmount());
                }
                
                return Optional.of(booking);
            }
            
            return Optional.empty();
        } catch (Exception e) {
            System.err.println("Error in BookingDao.findById: " + e.getMessage());
            e.printStackTrace();
            return Optional.empty();
        }
    }

    @Override
    public List<Booking> findAll() {
        try {
            List<Booking> bookings = super.findAll();
            
            // Initialize lazy-loaded associations for each booking
            for (Booking booking : bookings) {
                initializeBookingAssociations(booking);
            }
            
            return bookings;
        } catch (Exception e) {
            System.err.println("Error in BookingDao.findAll: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    @Override
    public List<Booking> findByRider(User rider) {
        try {
            CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
            CriteriaQuery<Booking> cq = cb.createQuery(Booking.class);
            Root<Booking> root = cq.from(Booking.class);
            cq.select(root).where(cb.equal(root.get("rider"), rider));
            
            List<Booking> bookings = getCurrentSession().createQuery(cq).getResultList();
            
            // Initialize lazy-loaded associations
            for (Booking booking : bookings) {
                initializeBookingAssociations(booking);
            }
            
            return bookings;
        } catch (Exception e) {
            System.err.println("Error in BookingDao.findByRider: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    @Override
    public List<Booking> findByRide(Ride ride) {
        try {
            CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
            CriteriaQuery<Booking> cq = cb.createQuery(Booking.class);
            Root<Booking> root = cq.from(Booking.class);
            cq.select(root).where(cb.equal(root.get("ride"), ride));
            
            List<Booking> bookings = getCurrentSession().createQuery(cq).getResultList();
            
            // Initialize lazy-loaded associations
            for (Booking booking : bookings) {
                initializeBookingAssociations(booking);
            }
            
            return bookings;
        } catch (Exception e) {
            System.err.println("Error in BookingDao.findByRide: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    @Override
    public List<Booking> findByStatus(Booking.BookingStatus status) {
        try {
            CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
            CriteriaQuery<Booking> cq = cb.createQuery(Booking.class);
            Root<Booking> root = cq.from(Booking.class);
            cq.select(root).where(cb.equal(root.get("status"), status));
            
            List<Booking> bookings = getCurrentSession().createQuery(cq).getResultList();
            
            // Initialize lazy-loaded associations
            for (Booking booking : bookings) {
                initializeBookingAssociations(booking);
            }
            
            return bookings;
        } catch (Exception e) {
            System.err.println("Error in BookingDao.findByStatus: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }
    
    @Override
    public List<Booking> findByRiderAndStatus(User rider, Booking.BookingStatus status) {
        try {
            CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
            CriteriaQuery<Booking> cq = cb.createQuery(Booking.class);
            Root<Booking> root = cq.from(Booking.class);
            
            Predicate riderPredicate = cb.equal(root.get("rider"), rider);
            Predicate statusPredicate = cb.equal(root.get("status"), status);
            
            cq.select(root).where(cb.and(riderPredicate, statusPredicate));
            
            List<Booking> bookings = getCurrentSession().createQuery(cq).getResultList();
            
            // Initialize lazy-loaded associations
            for (Booking booking : bookings) {
                initializeBookingAssociations(booking);
            }
            
            return bookings;
        } catch (Exception e) {
            System.err.println("Error in BookingDao.findByRiderAndStatus: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }
    
    @Override
    public List<Booking> findByRideAndStatus(Ride ride, Booking.BookingStatus status) {
        try {
            CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
            CriteriaQuery<Booking> cq = cb.createQuery(Booking.class);
            Root<Booking> root = cq.from(Booking.class);
            
            Predicate ridePredicate = cb.equal(root.get("ride"), ride);
            Predicate statusPredicate = cb.equal(root.get("status"), status);
            
            cq.select(root).where(cb.and(ridePredicate, statusPredicate));
            
            List<Booking> bookings = getCurrentSession().createQuery(cq).getResultList();
            
            // Initialize lazy-loaded associations
            for (Booking booking : bookings) {
                initializeBookingAssociations(booking);
            }
            
            return bookings;
        } catch (Exception e) {
            System.err.println("Error in BookingDao.findByRideAndStatus: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }
    
    @Override
    public List<Booking> findPaidBookings() {
        try {
            CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
            CriteriaQuery<Booking> cq = cb.createQuery(Booking.class);
            Root<Booking> bookingRoot = cq.from(Booking.class);
            Join<Booking, Payment> paymentJoin = bookingRoot.join("payment", JoinType.INNER);
            
            cq.select(bookingRoot)
              .where(cb.equal(paymentJoin.get("status"), Payment.PaymentStatus.COMPLETED));
              
            List<Booking> bookings = getCurrentSession().createQuery(cq).getResultList();
            
            // Initialize lazy-loaded associations
            for (Booking booking : bookings) {
                initializeBookingAssociations(booking);
            }
            
            return bookings;
        } catch (Exception e) {
            System.err.println("Error in BookingDao.findPaidBookings: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }
    
    @Override
    public List<Booking> findUnpaidBookings() {
        try {
            CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
            CriteriaQuery<Booking> cq = cb.createQuery(Booking.class);
            Root<Booking> bookingRoot = cq.from(Booking.class);
            
            // Either no payment exists or payment is not completed
            Subquery<Long> paymentSubquery = cq.subquery(Long.class);
            Root<Payment> paymentRoot = paymentSubquery.from(Payment.class);
            
            paymentSubquery.select(paymentRoot.get("id"))
                .where(
                    cb.and(
                        cb.equal(paymentRoot.get("booking"), bookingRoot),
                        cb.equal(paymentRoot.get("status"), Payment.PaymentStatus.COMPLETED)
                    )
                );
            
            cq.select(bookingRoot)
              .where(cb.not(cb.exists(paymentSubquery)));
              
            List<Booking> bookings = getCurrentSession().createQuery(cq).getResultList();
            
            // Initialize lazy-loaded associations
            for (Booking booking : bookings) {
                initializeBookingAssociations(booking);
            }
            
            return bookings;
        } catch (Exception e) {
            System.err.println("Error in BookingDao.findUnpaidBookings: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }
    
    /**
     * Helper method to initialize lazy-loaded associations
     */
    private void initializeBookingAssociations(Booking booking) {
        try {
            if (booking.getRide() != null) {
                Hibernate.initialize(booking.getRide());
                if (booking.getRide().getDriver() != null) {
                    Hibernate.initialize(booking.getRide().getDriver());
                }
            }
            if (booking.getRider() != null) {
                Hibernate.initialize(booking.getRider());
            }
        } catch (Exception e) {
            System.err.println("Error initializing booking associations: " + e.getMessage());
        }
    }
}
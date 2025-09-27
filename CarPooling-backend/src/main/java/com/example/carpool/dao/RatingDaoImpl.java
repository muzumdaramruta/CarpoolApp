package com.example.carpool.dao;

import com.example.carpool.model.Rating;
import com.example.carpool.model.User;
import com.example.carpool.model.Ride;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import java.util.List;
import java.util.Optional;

@Repository
public class RatingDaoImpl extends BaseDaoImpl<Rating> implements RatingDao {

    @Override
    @Transactional(readOnly = true)
    public List<Rating> findByDriver(User driver) {
        CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
        CriteriaQuery<Rating> cq = cb.createQuery(Rating.class);
        Root<Rating> root = cq.from(Rating.class);
        cq.select(root).where(cb.equal(root.get("driver"), driver));
        cq.orderBy(cb.desc(root.get("createdAt")));
        return getCurrentSession().createQuery(cq).getResultList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Rating> findByRider(User rider) {
        CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
        CriteriaQuery<Rating> cq = cb.createQuery(Rating.class);
        Root<Rating> root = cq.from(Rating.class);
        cq.select(root).where(cb.equal(root.get("rider"), rider));
        cq.orderBy(cb.desc(root.get("createdAt")));
        return getCurrentSession().createQuery(cq).getResultList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Rating> findByRideAndRider(Ride ride, User rider) {
        CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
        CriteriaQuery<Rating> cq = cb.createQuery(Rating.class);
        Root<Rating> root = cq.from(Rating.class);
        cq.select(root).where(
            cb.and(
                cb.equal(root.get("ride"), ride),
                cb.equal(root.get("rider"), rider)
            )
        );
        
        List<Rating> results = getCurrentSession().createQuery(cq).getResultList();
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageRatingForDriver(Long driverId) {
        String jpql = "SELECT AVG(r.rating) FROM Rating r WHERE r.driver.id = :driverId";
        Double result = getCurrentSession()
            .createQuery(jpql, Double.class)
            .setParameter("driverId", driverId)
            .getSingleResult();
        return result != null ? result : 0.0;
    }

    @Override
    @Transactional(readOnly = true)
    public Long getTotalRatingsForDriver(Long driverId) {
        String jpql = "SELECT COUNT(r) FROM Rating r WHERE r.driver.id = :driverId";
        return getCurrentSession()
            .createQuery(jpql, Long.class)
            .setParameter("driverId", driverId)
            .getSingleResult();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Rating> findRecentRatingsForDriver(Long driverId, int limit) {
        String jpql = "SELECT r FROM Rating r WHERE r.driver.id = :driverId ORDER BY r.createdAt DESC";
        return getCurrentSession()
            .createQuery(jpql, Rating.class)
            .setParameter("driverId", driverId)
            .setMaxResults(limit)
            .getResultList();
    }
}
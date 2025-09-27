package com.example.carpool.dao;

import com.example.carpool.model.Booking;
import com.example.carpool.model.Payment;
import org.springframework.stereotype.Repository;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import java.util.List;
import java.util.Optional;

@Repository
public class PaymentDaoImpl extends BaseDaoImpl<Payment> implements PaymentDao {

    @Override
    public Optional<Payment> findByBooking(Booking booking) {
        CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
        CriteriaQuery<Payment> cq = cb.createQuery(Payment.class);
        Root<Payment> root = cq.from(Payment.class);
        cq.select(root).where(cb.equal(root.get("booking"), booking));
        List<Payment> payments = getCurrentSession().createQuery(cq).getResultList();
        return payments.isEmpty() ? Optional.empty() : Optional.of(payments.get(0));
    }

    @Override
    public Optional<Payment> findByStripePaymentId(String stripePaymentId) {
        CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
        CriteriaQuery<Payment> cq = cb.createQuery(Payment.class);
        Root<Payment> root = cq.from(Payment.class);
        cq.select(root).where(cb.equal(root.get("stripePaymentId"), stripePaymentId));
        List<Payment> payments = getCurrentSession().createQuery(cq).getResultList();
        return payments.isEmpty() ? Optional.empty() : Optional.of(payments.get(0));
    }
    
    @Override
    public List<Payment> findByStatus(Payment.PaymentStatus status) {
        CriteriaBuilder cb = getCurrentSession().getCriteriaBuilder();
        CriteriaQuery<Payment> cq = cb.createQuery(Payment.class);
        Root<Payment> root = cq.from(Payment.class);
        cq.select(root).where(cb.equal(root.get("status"), status));
        return getCurrentSession().createQuery(cq).getResultList();
    }
}
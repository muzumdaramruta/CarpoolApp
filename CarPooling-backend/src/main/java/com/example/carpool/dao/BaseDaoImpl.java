package com.example.carpool.dao;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.ParameterizedType;
import java.util.List;
import java.util.Optional;

@Transactional
public abstract class BaseDaoImpl<T> implements BaseDao<T> {
    @Autowired
    protected SessionFactory sessionFactory;
    private final Class<T> entityClass;

    @SuppressWarnings("unchecked")
    public BaseDaoImpl() {
        this.entityClass = (Class<T>) ((ParameterizedType) getClass().getGenericSuperclass())
                .getActualTypeArguments()[0];
    }

    protected Session getCurrentSession() {
        return sessionFactory.getCurrentSession();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<T> findById(Long id) {
        return Optional.ofNullable(getCurrentSession().get(entityClass, id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<T> findAll() {
        Query<T> query = getCurrentSession().createQuery("from " + entityClass.getName(), entityClass);
        return query.getResultList();
    }

    @Override
    @Transactional
    public void save(T entity) {
        getCurrentSession().persist(entity);  // Use persist() instead of save()
    }

    @Override
    @Transactional
    public void update(T entity) {
        getCurrentSession().merge(entity);  // Use merge() instead of update()
    }

    @Override
    @Transactional
    public void delete(T entity) {
        getCurrentSession().remove(entity);  // Use remove() instead of delete()
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        T entity = getCurrentSession().get(entityClass, id);
        if (entity != null) {
            getCurrentSession().remove(entity);  // Use remove() instead of delete()
        }
    }
}
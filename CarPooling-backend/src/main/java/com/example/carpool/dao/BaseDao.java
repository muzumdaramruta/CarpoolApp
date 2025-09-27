package com.example.carpool.dao;

import java.util.Optional;
import java.util.List;

public interface BaseDao<T> {
    Optional<T> findById(Long id);
    List<T> findAll();
    void save(T entity);
    void update(T entity);
    void delete(T entity);
    void deleteById(Long id);
}
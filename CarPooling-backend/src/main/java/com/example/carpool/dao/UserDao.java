package com.example.carpool.dao;

import com.example.carpool.model.User;
import java.util.List;
import java.util.Optional;

public interface UserDao extends BaseDao<User> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByRole(User.UserRole role);
}
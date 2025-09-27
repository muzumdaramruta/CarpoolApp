package com.example.carpool.services;

import com.example.carpool.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    Optional<User> findById(Long id);
    List<User> findAll();
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByRole(User.UserRole role);
    void save(User user);
    void update(User user);
    void delete(User user);
    void deleteById(Long id);
}

package com.zumovo.trading.repository;

import com.zumovo.trading.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for User entities.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their username.
     *
     * @param username the username to search for
     * @return an Optional containing the user if found
     */
    Optional<User> findByUsername(String username);

    /**
     * Check whether a user with the given username already exists.
     *
     * @param username the username to check
     * @return true if a user with that username exists
     */
    boolean existsByUsername(String username);
}

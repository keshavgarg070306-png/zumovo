package com.zumovo.trading.repository;

import com.zumovo.trading.entity.Signal;
import com.zumovo.trading.enums.SignalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for Signal entities.
 */
@Repository
public interface SignalRepository extends JpaRepository<Signal, UUID> {

    /**
     * Find all signals with the given status.
     *
     * @param status the signal status to filter by
     * @return list of matching signals
     */
    List<Signal> findByStatus(SignalStatus status);

    /**
     * Find all signals ordered by creation time descending (newest first).
     *
     * @return list of all signals sorted by createdAt DESC
     */
    List<Signal> findAllByOrderByCreatedAtDesc();
}

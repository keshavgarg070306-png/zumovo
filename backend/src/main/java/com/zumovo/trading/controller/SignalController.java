package com.zumovo.trading.controller;

import com.zumovo.trading.dto.SignalRequest;
import com.zumovo.trading.dto.SignalResponse;
import com.zumovo.trading.dto.SignalStatusResponse;
import com.zumovo.trading.service.SignalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing trading signals.
 * Provides CRUD operations and status monitoring endpoints.
 */
@RestController
@RequestMapping("/api/signals")
@RequiredArgsConstructor
@Tag(name = "Signals", description = "Trading signal management endpoints")
public class SignalController {

    private final SignalService signalService;

    /**
     * Creates a new trading signal.
     *
     * @param request the validated signal creation request
     * @return the created signal with 201 status
     */
    @PostMapping
    @Operation(summary = "Create a new trading signal")
    public ResponseEntity<SignalResponse> createSignal(@Valid @RequestBody SignalRequest request) {
        SignalResponse response = signalService.createSignal(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieves all trading signals ordered by creation time.
     *
     * @return list of all signals enriched with market data
     */
    @GetMapping
    @Operation(summary = "Get all trading signals")
    public ResponseEntity<List<SignalResponse>> getAllSignals() {
        return ResponseEntity.ok(signalService.getAllSignals());
    }

    /**
     * Retrieves a single trading signal by ID.
     *
     * @param id the signal UUID
     * @return the signal enriched with market data
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get a trading signal by ID")
    public ResponseEntity<SignalResponse> getSignalById(@PathVariable UUID id) {
        return ResponseEntity.ok(signalService.getSignalById(id));
    }

    /**
     * Deletes a trading signal by ID.
     *
     * @param id the signal UUID
     * @return 204 No Content on success
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a trading signal")
    public ResponseEntity<Void> deleteSignal(@PathVariable UUID id) {
        signalService.deleteSignal(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Returns the current status of a trading signal.
     *
     * @param id the signal UUID
     * @return lightweight status response with current price and ROI
     */
    @GetMapping("/{id}/status")
    @Operation(summary = "Get signal status with current price and ROI")
    public ResponseEntity<SignalStatusResponse> getSignalStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(signalService.getSignalStatus(id));
    }
}

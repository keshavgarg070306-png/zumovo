package com.zumovo.trading.service;

import com.zumovo.trading.dto.SignalRequest;
import com.zumovo.trading.dto.SignalResponse;
import com.zumovo.trading.dto.SignalStatusResponse;
import com.zumovo.trading.entity.Signal;
import com.zumovo.trading.enums.SignalDirection;
import com.zumovo.trading.enums.SignalStatus;
import com.zumovo.trading.repository.SignalRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Core service for trading signal CRUD operations, price enrichment,
 * and automated signal evaluation against market data.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SignalService {

    private final SignalRepository signalRepository;
    private final BinancePriceService binancePriceService;

    /**
     * Creates a new trading signal from the validated request.
     *
     * @param request the validated signal creation request
     * @return the created signal enriched with current market data
     */
    @Transactional
    public SignalResponse createSignal(SignalRequest request) {
        Signal signal = Signal.builder()
                .symbol(request.getSymbol().toUpperCase())
                .direction(SignalDirection.valueOf(request.getDirection().toUpperCase()))
                .entryPrice(request.getEntryPrice())
                .stopLoss(request.getStopLoss())
                .targetPrice(request.getTargetPrice())
                .entryTime(request.getEntryTime())
                .expiryTime(request.getExpiryTime())
                .status(SignalStatus.OPEN)
                .build();

        Signal saved = signalRepository.save(signal);
        log.info("Created signal {} for {} {}", saved.getId(), saved.getDirection(), saved.getSymbol());

        BigDecimal currentPrice = binancePriceService.getPrice(saved.getSymbol());
        BigDecimal unrealizedRoi = currentPrice != null ? calculateRoi(saved, currentPrice) : null;

        return SignalResponse.fromEntity(saved, currentPrice, unrealizedRoi);
    }

    /**
     * Retrieves all signals ordered by creation time descending, enriched with market data.
     *
     * @return list of all signals with current prices and unrealized ROI
     */
    @Transactional(readOnly = true)
    public List<SignalResponse> getAllSignals() {
        return signalRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(signal -> {
                    BigDecimal currentPrice = binancePriceService.getPrice(signal.getSymbol());
                    BigDecimal unrealizedRoi = currentPrice != null ? calculateRoi(signal, currentPrice) : null;
                    return SignalResponse.fromEntity(signal, currentPrice, unrealizedRoi);
                })
                .toList();
    }

    /**
     * Retrieves a single signal by its ID, enriched with market data.
     *
     * @param id the signal UUID
     * @return the signal response with current price and unrealized ROI
     * @throws EntityNotFoundException if the signal is not found
     */
    @Transactional(readOnly = true)
    public SignalResponse getSignalById(UUID id) {
        Signal signal = signalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Signal not found with id: " + id));

        BigDecimal currentPrice = binancePriceService.getPrice(signal.getSymbol());
        BigDecimal unrealizedRoi = currentPrice != null ? calculateRoi(signal, currentPrice) : null;

        return SignalResponse.fromEntity(signal, currentPrice, unrealizedRoi);
    }

    /**
     * Permanently deletes a signal by its ID.
     *
     * @param id the signal UUID
     * @throws EntityNotFoundException if the signal is not found
     */
    @Transactional
    public void deleteSignal(UUID id) {
        if (!signalRepository.existsById(id)) {
            throw new EntityNotFoundException("Signal not found with id: " + id);
        }
        signalRepository.deleteById(id);
        log.info("Deleted signal {}", id);
    }

    /**
     * Returns a lightweight status response for the given signal.
     *
     * @param id the signal UUID
     * @return the signal status with current price and ROI
     * @throws EntityNotFoundException if the signal is not found
     */
    @Transactional(readOnly = true)
    public SignalStatusResponse getSignalStatus(UUID id) {
        Signal signal = signalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Signal not found with id: " + id));

        BigDecimal currentPrice = binancePriceService.getPrice(signal.getSymbol());
        BigDecimal roi = signal.getRealizedRoi() != null
                ? signal.getRealizedRoi()
                : (currentPrice != null ? calculateRoi(signal, currentPrice) : null);

        return SignalStatusResponse.builder()
                .id(signal.getId())
                .symbol(signal.getSymbol())
                .status(signal.getStatus())
                .currentPrice(currentPrice)
                .roi(roi)
                .build();
    }

    /**
     * Evaluates an open signal against the current market price and updates
     * its status if a target, stop-loss, or expiry condition is met.
     * Signals in a final state (TARGET_HIT, STOPLOSS_HIT, EXPIRED) are skipped.
     *
     * @param signal the signal to evaluate
     */
    @Transactional
    public void evaluateAndUpdateSignal(Signal signal) {
        if (signal.getStatus() != SignalStatus.OPEN) {
            return; // Signal is in a final state
        }

        BigDecimal currentPrice = binancePriceService.getPrice(signal.getSymbol());
        if (currentPrice == null) {
            log.warn("Cannot evaluate signal {} — price unavailable for {}", signal.getId(), signal.getSymbol());
            return;
        }

        SignalStatus newStatus = null;

        if (signal.getDirection() == SignalDirection.BUY) {
            if (currentPrice.compareTo(signal.getTargetPrice()) >= 0) {
                newStatus = SignalStatus.TARGET_HIT;
            } else if (currentPrice.compareTo(signal.getStopLoss()) <= 0) {
                newStatus = SignalStatus.STOPLOSS_HIT;
            }
        } else if (signal.getDirection() == SignalDirection.SELL) {
            if (currentPrice.compareTo(signal.getTargetPrice()) <= 0) {
                newStatus = SignalStatus.TARGET_HIT;
            } else if (currentPrice.compareTo(signal.getStopLoss()) >= 0) {
                newStatus = SignalStatus.STOPLOSS_HIT;
            }
        }

        // Check expiry if no target/stoploss hit
        if (newStatus == null && LocalDateTime.now().isAfter(signal.getExpiryTime())) {
            newStatus = SignalStatus.EXPIRED;
        }

        if (newStatus != null) {
            SignalStatus previousStatus = signal.getStatus();
            signal.setStatus(newStatus);
            signal.setRealizedRoi(calculateRoi(signal, currentPrice));
            signalRepository.save(signal);
            log.info("Signal {} transitioned from {} to {} (price: {})",
                    signal.getId(), previousStatus, newStatus, currentPrice);
        }
    }

    /**
     * Calculates the ROI percentage for a signal given the current price.
     * BUY: (currentPrice - entryPrice) / entryPrice * 100
     * SELL: (entryPrice - currentPrice) / entryPrice * 100
     *
     * @param signal       the signal entity
     * @param currentPrice the current market price
     * @return the ROI percentage scaled to 2 decimal places
     */
    public BigDecimal calculateRoi(Signal signal, BigDecimal currentPrice) {
        BigDecimal entryPrice = signal.getEntryPrice();

        if (signal.getDirection() == SignalDirection.BUY) {
            return currentPrice.subtract(entryPrice)
                    .divide(entryPrice, 10, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        } else {
            return entryPrice.subtract(currentPrice)
                    .divide(entryPrice, 10, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }
    }
}

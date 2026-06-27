package com.zumovo.trading.service;

import com.zumovo.trading.entity.Signal;
import com.zumovo.trading.enums.SignalStatus;
import com.zumovo.trading.repository.SignalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Scheduled service that periodically evaluates all open signals
 * against current market prices to detect target hits, stop-losses, and expiries.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SignalSchedulerService {

    private final SignalService signalService;
    private final SignalRepository signalRepository;

    /**
     * Runs every 10 seconds to evaluate all OPEN signals.
     * Each signal is checked against the current market price for its symbol.
     */
    @Scheduled(fixedRate = 10000)
    public void evaluateOpenSignals() {
        List<Signal> openSignals = signalRepository.findByStatus(SignalStatus.OPEN);

        if (openSignals.isEmpty()) {
            return;
        }

        log.debug("Evaluating {} open signals", openSignals.size());

        for (Signal signal : openSignals) {
            try {
                signalService.evaluateAndUpdateSignal(signal);
            } catch (Exception e) {
                log.error("Error evaluating signal {}: {}", signal.getId(), e.getMessage(), e);
            }
        }
    }
}

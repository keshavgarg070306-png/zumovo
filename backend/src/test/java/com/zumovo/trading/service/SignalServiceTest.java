package com.zumovo.trading.service;

import com.zumovo.trading.entity.Signal;
import com.zumovo.trading.enums.SignalDirection;
import com.zumovo.trading.enums.SignalStatus;
import com.zumovo.trading.repository.SignalRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for SignalService covering ROI calculation and signal evaluation logic.
 */
@ExtendWith(MockitoExtension.class)
class SignalServiceTest {

    @Mock
    private SignalRepository signalRepository;

    @Mock
    private BinancePriceService binancePriceService;

    @InjectMocks
    private SignalService signalService;

    // ==================== ROI Calculation Tests ====================

    @Test
    @DisplayName("BUY signal with positive ROI: entry=100, current=110 → ROI=10.00")
    void testCalculateRoi_BuySignal_Positive() {
        Signal signal = buildSignal(SignalDirection.BUY, new BigDecimal("100"));

        BigDecimal roi = signalService.calculateRoi(signal, new BigDecimal("110"));

        assertEquals(new BigDecimal("10.00"), roi);
    }

    @Test
    @DisplayName("BUY signal with negative ROI: entry=100, current=90 → ROI=-10.00")
    void testCalculateRoi_BuySignal_Negative() {
        Signal signal = buildSignal(SignalDirection.BUY, new BigDecimal("100"));

        BigDecimal roi = signalService.calculateRoi(signal, new BigDecimal("90"));

        assertEquals(new BigDecimal("-10.00"), roi);
    }

    @Test
    @DisplayName("SELL signal with positive ROI: entry=100, current=90 → ROI=10.00")
    void testCalculateRoi_SellSignal_Positive() {
        Signal signal = buildSignal(SignalDirection.SELL, new BigDecimal("100"));

        BigDecimal roi = signalService.calculateRoi(signal, new BigDecimal("90"));

        assertEquals(new BigDecimal("10.00"), roi);
    }

    @Test
    @DisplayName("SELL signal with negative ROI: entry=100, current=110 → ROI=-10.00")
    void testCalculateRoi_SellSignal_Negative() {
        Signal signal = buildSignal(SignalDirection.SELL, new BigDecimal("100"));

        BigDecimal roi = signalService.calculateRoi(signal, new BigDecimal("110"));

        assertEquals(new BigDecimal("-10.00"), roi);
    }

    // ==================== Signal Evaluation Tests ====================

    @Test
    @DisplayName("BUY signal: current price >= target price → TARGET_HIT")
    void testEvaluateSignal_BuyTargetHit() {
        Signal signal = buildFullSignal(
                SignalDirection.BUY,
                new BigDecimal("100"),
                new BigDecimal("90"),   // stopLoss
                new BigDecimal("120"),  // targetPrice
                SignalStatus.OPEN,
                LocalDateTime.now().plusHours(1)
        );

        when(binancePriceService.getPrice(signal.getSymbol())).thenReturn(new BigDecimal("120"));
        when(signalRepository.save(any(Signal.class))).thenReturn(signal);

        signalService.evaluateAndUpdateSignal(signal);

        assertEquals(SignalStatus.TARGET_HIT, signal.getStatus());
        assertNotNull(signal.getRealizedRoi());
        verify(signalRepository).save(signal);
    }

    @Test
    @DisplayName("BUY signal: current price <= stop loss → STOPLOSS_HIT")
    void testEvaluateSignal_BuyStoplossHit() {
        Signal signal = buildFullSignal(
                SignalDirection.BUY,
                new BigDecimal("100"),
                new BigDecimal("90"),
                new BigDecimal("120"),
                SignalStatus.OPEN,
                LocalDateTime.now().plusHours(1)
        );

        when(binancePriceService.getPrice(signal.getSymbol())).thenReturn(new BigDecimal("90"));
        when(signalRepository.save(any(Signal.class))).thenReturn(signal);

        signalService.evaluateAndUpdateSignal(signal);

        assertEquals(SignalStatus.STOPLOSS_HIT, signal.getStatus());
        assertNotNull(signal.getRealizedRoi());
        verify(signalRepository).save(signal);
    }

    @Test
    @DisplayName("SELL signal: current price <= target price → TARGET_HIT")
    void testEvaluateSignal_SellTargetHit() {
        Signal signal = buildFullSignal(
                SignalDirection.SELL,
                new BigDecimal("100"),
                new BigDecimal("110"),  // stopLoss (above entry for SELL)
                new BigDecimal("80"),   // targetPrice (below entry for SELL)
                SignalStatus.OPEN,
                LocalDateTime.now().plusHours(1)
        );

        when(binancePriceService.getPrice(signal.getSymbol())).thenReturn(new BigDecimal("80"));
        when(signalRepository.save(any(Signal.class))).thenReturn(signal);

        signalService.evaluateAndUpdateSignal(signal);

        assertEquals(SignalStatus.TARGET_HIT, signal.getStatus());
        assertNotNull(signal.getRealizedRoi());
        verify(signalRepository).save(signal);
    }

    @Test
    @DisplayName("SELL signal: current price >= stop loss → STOPLOSS_HIT")
    void testEvaluateSignal_SellStoplossHit() {
        Signal signal = buildFullSignal(
                SignalDirection.SELL,
                new BigDecimal("100"),
                new BigDecimal("110"),
                new BigDecimal("80"),
                SignalStatus.OPEN,
                LocalDateTime.now().plusHours(1)
        );

        when(binancePriceService.getPrice(signal.getSymbol())).thenReturn(new BigDecimal("110"));
        when(signalRepository.save(any(Signal.class))).thenReturn(signal);

        signalService.evaluateAndUpdateSignal(signal);

        assertEquals(SignalStatus.STOPLOSS_HIT, signal.getStatus());
        assertNotNull(signal.getRealizedRoi());
        verify(signalRepository).save(signal);
    }

    @Test
    @DisplayName("OPEN signal past expiry time → EXPIRED")
    void testEvaluateSignal_Expired() {
        Signal signal = buildFullSignal(
                SignalDirection.BUY,
                new BigDecimal("100"),
                new BigDecimal("90"),
                new BigDecimal("120"),
                SignalStatus.OPEN,
                LocalDateTime.now().minusMinutes(1)  // Already expired
        );

        when(binancePriceService.getPrice(signal.getSymbol())).thenReturn(new BigDecimal("105"));
        when(signalRepository.save(any(Signal.class))).thenReturn(signal);

        signalService.evaluateAndUpdateSignal(signal);

        assertEquals(SignalStatus.EXPIRED, signal.getStatus());
        assertNotNull(signal.getRealizedRoi());
        verify(signalRepository).save(signal);
    }

    @Test
    @DisplayName("Signal in final state (TARGET_HIT) should not be changed")
    void testEvaluateSignal_FinalStateNotChanged() {
        Signal signal = buildFullSignal(
                SignalDirection.BUY,
                new BigDecimal("100"),
                new BigDecimal("90"),
                new BigDecimal("120"),
                SignalStatus.TARGET_HIT,
                LocalDateTime.now().plusHours(1)
        );

        signalService.evaluateAndUpdateSignal(signal);

        assertEquals(SignalStatus.TARGET_HIT, signal.getStatus());
        verify(signalRepository, never()).save(any());
        verify(binancePriceService, never()).getPrice(anyString());
    }

    @Test
    @DisplayName("OPEN signal with price between entry and target/stoploss stays OPEN")
    void testEvaluateSignal_OpenSignalNoChange() {
        Signal signal = buildFullSignal(
                SignalDirection.BUY,
                new BigDecimal("100"),
                new BigDecimal("90"),
                new BigDecimal("120"),
                SignalStatus.OPEN,
                LocalDateTime.now().plusHours(1)
        );

        // Price at 105 — between stopLoss (90) and target (120)
        when(binancePriceService.getPrice(signal.getSymbol())).thenReturn(new BigDecimal("105"));

        signalService.evaluateAndUpdateSignal(signal);

        assertEquals(SignalStatus.OPEN, signal.getStatus());
        assertNull(signal.getRealizedRoi());
        verify(signalRepository, never()).save(any());
    }

    // ==================== Helper Methods ====================

    private Signal buildSignal(SignalDirection direction, BigDecimal entryPrice) {
        return Signal.builder()
                .id(UUID.randomUUID())
                .symbol("BTCUSDT")
                .direction(direction)
                .entryPrice(entryPrice)
                .status(SignalStatus.OPEN)
                .build();
    }

    private Signal buildFullSignal(SignalDirection direction, BigDecimal entryPrice,
                                   BigDecimal stopLoss, BigDecimal targetPrice,
                                   SignalStatus status, LocalDateTime expiryTime) {
        return Signal.builder()
                .id(UUID.randomUUID())
                .symbol("BTCUSDT")
                .direction(direction)
                .entryPrice(entryPrice)
                .stopLoss(stopLoss)
                .targetPrice(targetPrice)
                .entryTime(LocalDateTime.now().minusMinutes(30))
                .expiryTime(expiryTime)
                .status(status)
                .build();
    }
}

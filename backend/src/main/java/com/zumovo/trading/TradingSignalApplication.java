package com.zumovo.trading;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main entry point for the Trading Signal Tracking Application.
 */
@SpringBootApplication
@EnableScheduling
@EnableCaching
public class TradingSignalApplication {

    public static void main(String[] args) {
        SpringApplication.run(TradingSignalApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner seedUser(
            com.zumovo.trading.repository.UserRepository userRepository,
            com.zumovo.trading.repository.SignalRepository signalRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
                com.zumovo.trading.entity.User defaultUser = com.zumovo.trading.entity.User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("password123"))
                        .build();
                userRepository.save(defaultUser);
                System.out.println("Seeded default user 'admin' with password 'password123'");
            }

            if (signalRepository.count() == 0) {
                java.time.LocalDateTime now = java.time.LocalDateTime.now();

                // Active signals (OPEN) - prices will match current market
                com.zumovo.trading.entity.Signal signal1 = com.zumovo.trading.entity.Signal.builder()
                        .symbol("BTCUSDT")
                        .direction(com.zumovo.trading.enums.SignalDirection.BUY)
                        .entryPrice(new java.math.BigDecimal("90000.00"))
                        .stopLoss(new java.math.BigDecimal("87000.00"))
                        .targetPrice(new java.math.BigDecimal("99000.00"))
                        .entryTime(now.minusHours(2))
                        .expiryTime(now.plusHours(22))
                        .status(com.zumovo.trading.enums.SignalStatus.OPEN)
                        .build();

                com.zumovo.trading.entity.Signal signal2 = com.zumovo.trading.entity.Signal.builder()
                        .symbol("ETHUSDT")
                        .direction(com.zumovo.trading.enums.SignalDirection.BUY)
                        .entryPrice(new java.math.BigDecimal("3100.00"))
                        .stopLoss(new java.math.BigDecimal("2900.00"))
                        .targetPrice(new java.math.BigDecimal("3600.00"))
                        .entryTime(now.minusHours(1))
                        .expiryTime(now.plusHours(12))
                        .status(com.zumovo.trading.enums.SignalStatus.OPEN)
                        .build();

                com.zumovo.trading.entity.Signal signal3 = com.zumovo.trading.entity.Signal.builder()
                        .symbol("SOLUSDT")
                        .direction(com.zumovo.trading.enums.SignalDirection.SELL)
                        .entryPrice(new java.math.BigDecimal("148.00"))
                        .stopLoss(new java.math.BigDecimal("158.00"))
                        .targetPrice(new java.math.BigDecimal("125.00"))
                        .entryTime(now.minusMinutes(30))
                        .expiryTime(now.plusHours(6))
                        .status(com.zumovo.trading.enums.SignalStatus.OPEN)
                        .build();

                // Closed signals (TARGET_HIT / STOPLOSS_HIT / EXPIRED)
                com.zumovo.trading.entity.Signal signal4 = com.zumovo.trading.entity.Signal.builder()
                        .symbol("BTCUSDT")
                        .direction(com.zumovo.trading.enums.SignalDirection.BUY)
                        .entryPrice(new java.math.BigDecimal("62000.00"))
                        .stopLoss(new java.math.BigDecimal("60000.00"))
                        .targetPrice(new java.math.BigDecimal("65000.00"))
                        .entryTime(now.minusDays(1))
                        .expiryTime(now.minusHours(4))
                        .status(com.zumovo.trading.enums.SignalStatus.TARGET_HIT)
                        .realizedRoi(new java.math.BigDecimal("4.84"))
                        .build();

                com.zumovo.trading.entity.Signal signal5 = com.zumovo.trading.entity.Signal.builder()
                        .symbol("ETHUSDT")
                        .direction(com.zumovo.trading.enums.SignalDirection.SELL)
                        .entryPrice(new java.math.BigDecimal("3500.00"))
                        .stopLoss(new java.math.BigDecimal("3650.00"))
                        .targetPrice(new java.math.BigDecimal("3300.00"))
                        .entryTime(now.minusDays(1))
                        .expiryTime(now.minusHours(6))
                        .status(com.zumovo.trading.enums.SignalStatus.STOPLOSS_HIT)
                        .realizedRoi(new java.math.BigDecimal("-4.29"))
                        .build();

                com.zumovo.trading.entity.Signal signal6 = com.zumovo.trading.entity.Signal.builder()
                        .symbol("BNBUSDT")
                        .direction(com.zumovo.trading.enums.SignalDirection.BUY)
                        .entryPrice(new java.math.BigDecimal("580.00"))
                        .stopLoss(new java.math.BigDecimal("540.00"))
                        .targetPrice(new java.math.BigDecimal("650.00"))
                        .entryTime(now.minusDays(2))
                        .expiryTime(now.minusDays(1))
                        .status(com.zumovo.trading.enums.SignalStatus.EXPIRED)
                        .realizedRoi(new java.math.BigDecimal("1.25"))
                        .build();

                signalRepository.saveAll(java.util.List.of(signal1, signal2, signal3, signal4, signal5, signal6));
                System.out.println("Seeded default signals data for BTC, ETH, SOL, BNB");
            }
        };
    }
}

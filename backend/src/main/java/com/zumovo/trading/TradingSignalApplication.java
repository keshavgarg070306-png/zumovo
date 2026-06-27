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
        };
    }
}

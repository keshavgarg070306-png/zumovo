package com.zumovo.trading.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;

/**
 * Service for fetching real-time cryptocurrency prices from the Binance API.
 * Results are cached in Redis with a short TTL to reduce API calls.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BinancePriceService {

    private final WebClient webClient;

    /**
     * Inner record matching the Binance ticker/price API response shape.
     */
    public record BinancePriceResponse(String symbol, String price) {}

    /**
     * Fetches the current price for the given trading symbol from Binance.
     * Results are cached in Redis under the "prices" cache with the symbol as key.
     *
     * @param symbol the trading pair symbol (e.g., "BTCUSDT")
     * @return the current price as a BigDecimal, or null if the API call fails
     */
    @Cacheable(value = "prices", key = "#symbol")
    public BigDecimal getPrice(String symbol) {
        try {
            log.debug("Fetching price from Binance for symbol: {}", symbol);

            BinancePriceResponse response = webClient.get()
                    .uri("/ticker/price?symbol={symbol}", symbol)
                    .retrieve()
                    .bodyToMono(BinancePriceResponse.class)
                    .block();

            if (response != null && response.price() != null) {
                BigDecimal price = new BigDecimal(response.price());
                log.debug("Fetched price for {}: {}", symbol, price);
                return price;
            }

            log.warn("Empty response from Binance for symbol: {}", symbol);
            return null;
        } catch (Exception e) {
            log.warn("Failed to fetch price from Binance for symbol {}: {}", symbol, e.getMessage());
            return null;
        }
    }
}

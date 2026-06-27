package com.zumovo.trading.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Configuration for the reactive WebClient used to call the Binance API.
 */
@Configuration
public class WebClientConfig {

    @Value("${app.binance.base-url}")
    private String binanceBaseUrl;

    /**
     * Creates a WebClient bean pre-configured with the Binance API base URL.
     *
     * @return a configured WebClient instance
     */
    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .baseUrl(binanceBaseUrl)
                .build();
    }
}

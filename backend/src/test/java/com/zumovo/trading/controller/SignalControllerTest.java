package com.zumovo.trading.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.zumovo.trading.dto.SignalRequest;
import com.zumovo.trading.dto.SignalResponse;
import com.zumovo.trading.enums.SignalDirection;
import com.zumovo.trading.enums.SignalStatus;
import com.zumovo.trading.exception.GlobalExceptionHandler;
import com.zumovo.trading.service.SignalService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class SignalControllerTest {

    private MockMvc mockMvc;
    private SignalService signalService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        signalService = Mockito.mock(SignalService.class);
        SignalController controller = new SignalController(signalService);
        
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    @DisplayName("POST /api/signals with valid request returns 201")
    void testCreateSignal_ValidRequest() throws Exception {
        SignalRequest request = SignalRequest.builder()
                .symbol("BTCUSDT")
                .direction("BUY")
                .entryPrice(new BigDecimal("50000"))
                .stopLoss(new BigDecimal("48000"))
                .targetPrice(new BigDecimal("55000"))
                .entryTime(LocalDateTime.now())
                .expiryTime(LocalDateTime.now().plusHours(4))
                .build();

        UUID signalId = UUID.randomUUID();
        SignalResponse response = SignalResponse.builder()
                .id(signalId)
                .symbol("BTCUSDT")
                .direction(SignalDirection.BUY)
                .entryPrice(new BigDecimal("50000"))
                .stopLoss(new BigDecimal("48000"))
                .targetPrice(new BigDecimal("55000"))
                .entryTime(request.getEntryTime())
                .expiryTime(request.getExpiryTime())
                .status(SignalStatus.OPEN)
                .currentPrice(new BigDecimal("50500"))
                .unrealizedRoi(new BigDecimal("1.00"))
                .build();

        when(signalService.createSignal(any(SignalRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/signals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(signalId.toString()))
                .andExpect(jsonPath("$.symbol").value("BTCUSDT"))
                .andExpect(jsonPath("$.direction").value("BUY"))
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    @DisplayName("POST /api/signals with invalid price order returns 400")
    void testCreateSignal_InvalidPriceOrder() throws Exception {
        // BUY signal with stopLoss > entryPrice — invalid
        SignalRequest request = SignalRequest.builder()
                .symbol("BTCUSDT")
                .direction("BUY")
                .entryPrice(new BigDecimal("50000"))
                .stopLoss(new BigDecimal("55000"))   // stopLoss > entryPrice
                .targetPrice(new BigDecimal("60000"))
                .entryTime(LocalDateTime.now())
                .expiryTime(LocalDateTime.now().plusHours(4))
                .build();

        mockMvc.perform(post("/api/signals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/signals with missing symbol returns 400")
    void testCreateSignal_MissingFields() throws Exception {
        SignalRequest request = SignalRequest.builder()
                .direction("BUY")
                .entryPrice(new BigDecimal("50000"))
                .stopLoss(new BigDecimal("48000"))
                .targetPrice(new BigDecimal("55000"))
                .entryTime(LocalDateTime.now())
                .expiryTime(LocalDateTime.now().plusHours(4))
                .build();

        mockMvc.perform(post("/api/signals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/signals returns 200 with signal list")
    void testGetAllSignals() throws Exception {
        SignalResponse response = SignalResponse.builder()
                .id(UUID.randomUUID())
                .symbol("ETHUSDT")
                .direction(SignalDirection.SELL)
                .entryPrice(new BigDecimal("3000"))
                .stopLoss(new BigDecimal("3200"))
                .targetPrice(new BigDecimal("2700"))
                .entryTime(LocalDateTime.now())
                .expiryTime(LocalDateTime.now().plusHours(2))
                .status(SignalStatus.OPEN)
                .currentPrice(new BigDecimal("2950"))
                .unrealizedRoi(new BigDecimal("1.67"))
                .build();

        when(signalService.getAllSignals()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/signals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].symbol").value("ETHUSDT"));
    }

    @Test
    @DisplayName("GET /api/signals/{id} with non-existent ID returns 404")
    void testGetSignalNotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        when(signalService.getSignalById(nonExistentId))
                .thenThrow(new EntityNotFoundException("Signal not found with id: " + nonExistentId));

        mockMvc.perform(get("/api/signals/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Signal not found with id: " + nonExistentId));
    }
}

package com.zumovo.trading.dto;

import com.zumovo.trading.enums.SignalStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Lightweight response DTO for quick signal status checks.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignalStatusResponse {

    private UUID id;
    private String symbol;
    private SignalStatus status;
    private BigDecimal currentPrice;
    private BigDecimal roi;
}

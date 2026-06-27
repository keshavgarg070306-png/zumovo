package com.zumovo.trading.dto;

import com.zumovo.trading.entity.Signal;
import com.zumovo.trading.enums.SignalDirection;
import com.zumovo.trading.enums.SignalStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for a trading signal enriched with live market data.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignalResponse {

    private UUID id;
    private String symbol;
    private SignalDirection direction;
    private BigDecimal entryPrice;
    private BigDecimal stopLoss;
    private BigDecimal targetPrice;
    private LocalDateTime entryTime;
    private LocalDateTime expiryTime;
    private LocalDateTime createdAt;
    private SignalStatus status;
    private BigDecimal realizedRoi;
    private BigDecimal currentPrice;
    private BigDecimal unrealizedRoi;

    /**
     * Factory method to create a SignalResponse from a Signal entity,
     * enriched with the current market price and unrealized ROI.
     *
     * @param signal         the signal entity
     * @param currentPrice   the current market price of the symbol
     * @param unrealizedRoi  the calculated unrealized ROI percentage
     * @return a fully populated SignalResponse
     */
    public static SignalResponse fromEntity(Signal signal, BigDecimal currentPrice, BigDecimal unrealizedRoi) {
        return SignalResponse.builder()
                .id(signal.getId())
                .symbol(signal.getSymbol())
                .direction(signal.getDirection())
                .entryPrice(signal.getEntryPrice())
                .stopLoss(signal.getStopLoss())
                .targetPrice(signal.getTargetPrice())
                .entryTime(signal.getEntryTime())
                .expiryTime(signal.getExpiryTime())
                .createdAt(signal.getCreatedAt())
                .status(signal.getStatus())
                .realizedRoi(signal.getRealizedRoi())
                .currentPrice(currentPrice)
                .unrealizedRoi(unrealizedRoi)
                .build();
    }
}

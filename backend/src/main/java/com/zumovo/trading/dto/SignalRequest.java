package com.zumovo.trading.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Request DTO for creating a new trading signal.
 * Includes cross-field validation for price ordering and time constraints.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignalRequest {

    @NotBlank(message = "Symbol is required")
    private String symbol;

    @NotBlank(message = "Direction is required")
    private String direction;

    @NotNull(message = "Entry price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Entry price must be greater than 0")
    private BigDecimal entryPrice;

    @NotNull(message = "Stop loss is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Stop loss must be greater than 0")
    private BigDecimal stopLoss;

    @NotNull(message = "Target price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Target price must be greater than 0")
    private BigDecimal targetPrice;

    @NotNull(message = "Entry time is required")
    private LocalDateTime entryTime;

    @NotNull(message = "Expiry time is required")
    private LocalDateTime expiryTime;

    /**
     * Validates that price ordering is correct based on signal direction.
     * BUY: stopLoss < entryPrice < targetPrice
     * SELL: targetPrice < entryPrice < stopLoss
     */
    @AssertTrue(message = "Price order is invalid. BUY: stopLoss < entryPrice < targetPrice. SELL: targetPrice < entryPrice < stopLoss")
    public boolean isPriceOrderValid() {
        if (direction == null || entryPrice == null || stopLoss == null || targetPrice == null) {
            return true; // Let @NotNull / @NotBlank handle nulls
        }

        return switch (direction.toUpperCase()) {
            case "BUY" -> stopLoss.compareTo(entryPrice) < 0
                    && entryPrice.compareTo(targetPrice) < 0;
            case "SELL" -> targetPrice.compareTo(entryPrice) < 0
                    && entryPrice.compareTo(stopLoss) < 0;
            default -> false;
        };
    }

    /**
     * Validates that the expiry time is after the entry time.
     */
    @AssertTrue(message = "Expiry time must be after entry time")
    public boolean isExpiryAfterEntry() {
        if (entryTime == null || expiryTime == null) {
            return true;
        }
        return expiryTime.isAfter(entryTime);
    }

    /**
     * Validates that the entry time is not more than 24 hours in the past.
     */
    @AssertTrue(message = "Entry time cannot be more than 24 hours in the past")
    public boolean isEntryTimeValid() {
        if (entryTime == null) {
            return true;
        }
        return entryTime.isAfter(LocalDateTime.now().minusHours(24));
    }
}

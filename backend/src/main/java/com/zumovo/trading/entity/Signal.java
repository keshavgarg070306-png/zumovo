package com.zumovo.trading.entity;

import com.zumovo.trading.enums.SignalDirection;
import com.zumovo.trading.enums.SignalStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * JPA entity representing a trading signal with entry/exit parameters,
 * lifecycle status, and realized ROI tracking.
 */
@Entity
@Table(name = "signals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Signal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "symbol", nullable = false, length = 20)
    private String symbol;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", nullable = false, length = 4)
    private SignalDirection direction;

    @Column(name = "entry_price", nullable = false, precision = 20, scale = 8)
    private BigDecimal entryPrice;

    @Column(name = "stop_loss", nullable = false, precision = 20, scale = 8)
    private BigDecimal stopLoss;

    @Column(name = "target_price", nullable = false, precision = 20, scale = 8)
    private BigDecimal targetPrice;

    @Column(name = "entry_time", nullable = false)
    private LocalDateTime entryTime;

    @Column(name = "expiry_time", nullable = false)
    private LocalDateTime expiryTime;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private SignalStatus status = SignalStatus.OPEN;

    @Column(name = "realized_roi", precision = 10, scale = 2)
    private BigDecimal realizedRoi;
}

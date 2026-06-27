-- V1: Create signals table for tracking trading signals
CREATE TABLE signals (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol      VARCHAR(20)     NOT NULL,
    direction   VARCHAR(4)      NOT NULL CHECK (direction IN ('BUY', 'SELL')),
    entry_price DECIMAL(20, 8)  NOT NULL,
    stop_loss   DECIMAL(20, 8)  NOT NULL,
    target_price DECIMAL(20, 8) NOT NULL,
    entry_time  TIMESTAMP       NOT NULL,
    expiry_time TIMESTAMP       NOT NULL,
    created_at  TIMESTAMP       DEFAULT NOW(),
    status      VARCHAR(20)     DEFAULT 'OPEN',
    realized_roi DECIMAL(10, 2)
);

CREATE INDEX idx_signals_status ON signals (status);
CREATE INDEX idx_signals_symbol ON signals (symbol);
CREATE INDEX idx_signals_created_at ON signals (created_at DESC);

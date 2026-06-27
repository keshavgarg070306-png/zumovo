import React from 'react';
import { motion } from 'framer-motion';
import './PriceProgressBar.css';

interface PriceProgressBarProps {
  stopLoss: number;
  entryPrice: number;
  currentPrice: number | null;
  targetPrice: number;
}

const PriceProgressBar: React.FC<PriceProgressBarProps> = ({
  stopLoss,
  entryPrice,
  currentPrice,
  targetPrice,
}) => {
  const range = targetPrice - stopLoss;
  if (range <= 0) return null;

  const entryPercent = ((entryPrice - stopLoss) / range) * 100;
  const currentPercent = currentPrice !== null
    ? Math.max(0, Math.min(100, ((currentPrice - stopLoss) / range) * 100))
    : entryPercent;

  const formatPrice = (p: number) =>
    p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <motion.div
      className="price-progress"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="price-progress-labels">
        <div className="price-progress-label price-progress-label--sl">
          <span className="price-progress-label-text">Stop Loss</span>
          <span className="price-progress-label-value">${formatPrice(stopLoss)}</span>
        </div>
        <div className="price-progress-label price-progress-label--entry">
          <span className="price-progress-label-text">Entry</span>
          <span className="price-progress-label-value">${formatPrice(entryPrice)}</span>
        </div>
        {currentPrice !== null && (
          <div className="price-progress-label price-progress-label--current">
            <span className="price-progress-label-text">Current</span>
            <span className="price-progress-label-value">${formatPrice(currentPrice)}</span>
          </div>
        )}
        <div className="price-progress-label price-progress-label--target">
          <span className="price-progress-label-text">Target</span>
          <span className="price-progress-label-value">${formatPrice(targetPrice)}</span>
        </div>
      </div>

      <div className="price-progress-track">
        <div className="price-progress-gradient" />

        <motion.div
          className="price-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${currentPercent}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{ opacity: 0.4 }}
        />

        {/* Entry marker */}
        <div
          className="price-progress-marker price-progress-marker--entry"
          style={{ left: `${entryPercent}%` }}
        />

        {/* Current price dot */}
        {currentPrice !== null && (
          <motion.div
            className="price-progress-dot"
            initial={{ left: `${entryPercent}%`, opacity: 0, scale: 0 }}
            animate={{ left: `${currentPercent}%`, opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          >
            <div className="price-progress-dot-inner" />
            <div className="price-progress-tooltip">${formatPrice(currentPrice)}</div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PriceProgressBar;

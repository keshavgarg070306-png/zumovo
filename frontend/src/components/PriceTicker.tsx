import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './PriceTicker.css';

interface PriceTickerProps {
  price: number | null;
  previousPrice?: number | null;
  decimals?: number;
}

const PriceTicker: React.FC<PriceTickerProps> = ({ price, previousPrice, decimals = 2 }) => {
  const [flashClass, setFlashClass] = useState('');
  const prevRef = useRef<number | null>(previousPrice ?? null);

  useEffect(() => {
    if (price !== null && prevRef.current !== null) {
      if (price > prevRef.current) {
        setFlashClass('flash-green');
      } else if (price < prevRef.current) {
        setFlashClass('flash-red');
      }
      const timer = setTimeout(() => setFlashClass(''), 400);
      return () => clearTimeout(timer);
    }
    if (price !== null) {
      prevRef.current = price;
    }
  }, [price]);

  useEffect(() => {
    if (price !== null) {
      prevRef.current = price;
    }
  }, [price]);

  if (price === null) {
    return <span className="price-ticker price-ticker--neutral">—</span>;
  }

  const direction = previousPrice !== null && previousPrice !== undefined
    ? price > previousPrice ? 'up' : price < previousPrice ? 'down' : 'neutral'
    : 'neutral';

  return (
    <motion.span
      className={`price-ticker price-ticker--${direction} ${flashClass}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span>${price.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>
      {direction === 'up' && <span className="price-ticker-arrow">▲</span>}
      {direction === 'down' && <span className="price-ticker-arrow">▼</span>}
    </motion.span>
  );
};

export default PriceTicker;

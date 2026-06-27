import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './CountdownTimer.css';

interface CountdownTimerProps {
  expiryTime: string;
  large?: boolean;
  showLabels?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const getTimeLeft = (expiryTime: string): TimeLeft => {
  const total = new Date(expiryTime).getTime() - Date.now();
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  };
};

const pad = (n: number): string => n.toString().padStart(2, '0');

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiryTime, large, showLabels }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(expiryTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(expiryTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  const urgency =
    timeLeft.total <= 0
      ? 'expired'
      : timeLeft.total < 3600000
        ? 'danger'
        : timeLeft.total < 86400000
          ? 'warning'
          : 'safe';

  const segments = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hrs' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ];

  return (
    <motion.div
      className={`countdown-timer countdown-timer--${urgency} ${large ? 'countdown-timer--large' : ''}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {segments.map((seg, idx) => (
        <React.Fragment key={seg.label}>
          {idx > 0 && <span className="countdown-separator">:</span>}
          <div className={showLabels ? 'countdown-column' : 'countdown-digit-group'}>
            <motion.span
              className="countdown-digit"
              key={`${seg.label}-${seg.value}`}
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {pad(seg.value)}
            </motion.span>
            {showLabels && <span className="countdown-label">{seg.label}</span>}
          </div>
        </React.Fragment>
      ))}
    </motion.div>
  );
};

export default CountdownTimer;

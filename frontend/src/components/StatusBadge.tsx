import React from 'react';
import { motion } from 'framer-motion';
import { SignalStatus } from '../types';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: SignalStatus;
  large?: boolean;
}

const statusConfig: Record<SignalStatus, { label: string; className: string }> = {
  [SignalStatus.OPEN]: { label: 'Open', className: 'status-badge--open' },
  [SignalStatus.TARGET_HIT]: { label: 'Target Hit', className: 'status-badge--target-hit' },
  [SignalStatus.STOPLOSS_HIT]: { label: 'Stop Loss', className: 'status-badge--stoploss-hit' },
  [SignalStatus.EXPIRED]: { label: 'Expired', className: 'status-badge--expired' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, large }) => {
  const config = statusConfig[status];

  return (
    <motion.span
      className={`status-badge ${config.className} ${large ? 'status-badge--lg' : ''}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
    >
      <span className="status-badge-dot" />
      {config.label}
    </motion.span>
  );
};

export default StatusBadge;

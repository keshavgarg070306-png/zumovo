import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Trash2, BarChart3, PlusCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Signal, SignalDirection, SignalStatus } from '../types';
import StatusBadge from './StatusBadge';
import CountdownTimer from './CountdownTimer';
import SkeletonLoader from './SkeletonLoader';
import './SignalTable.css';

interface SignalTableProps {
  signals: Signal[];
  loading: boolean;
  onDelete: (id: string) => void;
}

type FilterType = 'all' | 'open' | 'closed';

const SignalTable: React.FC<SignalTableProps> = ({ signals, loading, onDelete }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredSignals = signals.filter((s) => {
    if (filter === 'open') return s.status === SignalStatus.OPEN;
    if (filter === 'closed') return s.status !== SignalStatus.OPEN;
    return true;
  });

  const formatPrice = (p: number) =>
    p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getRoi = (s: Signal): number | null => {
    if (s.realizedRoi !== null) return s.realizedRoi;
    if (s.unrealizedRoi !== null) return s.unrealizedRoi;
    return null;
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this signal?')) {
      onDelete(id);
    }
  };

  if (loading) {
    return (
      <div className="signal-table-container">
        <div className="signal-table-header">
          <div className="signal-table-title">
            <span className="signal-table-title-dot" />
            Trading Signals
          </div>
        </div>
        <SkeletonLoader variant="table-row" count={6} />
      </div>
    );
  }

  return (
    <motion.div
      className="signal-table-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="signal-table-header">
        <div className="signal-table-title">
          <span className="signal-table-title-dot" />
          Trading Signals
          <span className="signal-table-count">{filteredSignals.length}</span>
        </div>
        <div className="signal-table-filters">
          {(['all', 'open', 'closed'] as FilterType[]).map((f) => (
            <button
              key={f}
              className={`signal-table-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredSignals.length === 0 ? (
        <motion.div
          className="signal-table-empty"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="signal-table-empty-icon">
            <BarChart3 size={32} />
          </div>
          <div className="signal-table-empty-title">No signals yet</div>
          <div className="signal-table-empty-desc">
            Start tracking your trading signals by creating your first one.
          </div>
          <Link to="/create" className="signal-table-empty-btn">
            <PlusCircle size={16} />
            Create Signal
          </Link>
        </motion.div>
      ) : (
        <div className="signal-table-scroll">
          <table className="signal-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Direction</th>
                <th>Entry Price</th>
                <th>Current Price</th>
                <th>Target</th>
                <th>Stop Loss</th>
                <th>ROI</th>
                <th>Status</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredSignals.map((signal, index) => {
                  const roi = getRoi(signal);
                  const roiClass = roi !== null
                    ? roi > 0 ? 'positive' : roi < 0 ? 'negative' : 'neutral'
                    : 'neutral';

                  return (
                    <motion.tr
                      key={signal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      onClick={() => navigate(`/signals/${signal.id}`)}
                    >
                      <td>
                        <div className="signal-table-symbol">
                          <span className="signal-table-symbol-icon">
                            {signal.symbol.slice(0, 2)}
                          </span>
                          {signal.symbol}
                        </div>
                      </td>
                      <td>
                        <span className={`direction-badge direction-badge--${signal.direction.toLowerCase()}`}>
                          {signal.direction === SignalDirection.BUY ? (
                            <ArrowUpRight size={12} />
                          ) : (
                            <ArrowDownRight size={12} />
                          )}
                          {signal.direction}
                        </span>
                      </td>
                      <td>
                        <span className="signal-table-price">${formatPrice(signal.entryPrice)}</span>
                      </td>
                      <td>
                        <span className="signal-table-price">
                          {signal.currentPrice !== null ? `$${formatPrice(signal.currentPrice)}` : '—'}
                        </span>
                      </td>
                      <td>
                        <span className="signal-table-price" style={{ color: 'var(--accent-green)' }}>
                          ${formatPrice(signal.targetPrice)}
                        </span>
                      </td>
                      <td>
                        <span className="signal-table-price" style={{ color: 'var(--accent-red)' }}>
                          ${formatPrice(signal.stopLoss)}
                        </span>
                      </td>
                      <td>
                        <span className={`signal-table-roi signal-table-roi--${roiClass}`}>
                          {roi !== null ? `${roi > 0 ? '+' : ''}${roi.toFixed(2)}%` : '—'}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={signal.status} />
                      </td>
                      <td>
                        {signal.status === SignalStatus.OPEN ? (
                          <CountdownTimer expiryTime={signal.expiryTime} />
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            —
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="signal-table-actions" onClick={(e) => e.stopPropagation()}>
                          <motion.button
                            className="signal-table-action-btn"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/signals/${signal.id}`)}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </motion.button>
                          <motion.button
                            className="signal-table-action-btn signal-table-action-btn--delete"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleDelete(e, signal.id)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default SignalTable;

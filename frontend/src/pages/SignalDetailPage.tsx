import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  ArrowLeft,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  Target,
  Shield,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { signalApi } from '../services/api';
import { Signal, SignalDirection, SignalStatus } from '../types';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import ROIGauge from '../components/ROIGauge';
import PriceProgressBar from '../components/PriceProgressBar';
import AnimatedChart from '../components/AnimatedChart';
import CountdownTimer from '../components/CountdownTimer';
import SkeletonLoader from '../components/SkeletonLoader';
import './SignalDetailPage.css';

const SignalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSignal = useCallback(async () => {
    if (!id) return;
    try {
      const data = await signalApi.getSignal(id);
      setSignal(data);
    } catch {
      toast.error('Failed to fetch signal');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchSignal();
    const interval = setInterval(fetchSignal, 10000);
    return () => clearInterval(interval);
  }, [fetchSignal]);

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this signal?')) return;
    try {
      await signalApi.deleteSignal(id);
      toast.success('Signal deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete signal');
    }
  };

  const formatPrice = (p: number) =>
    p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (d: string) =>
    new Date(d).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <SkeletonLoader variant="detail-page" />
        </div>
      </>
    );
  }

  if (!signal) return null;

  const isBuy = signal.direction === SignalDirection.BUY;
  const roi = signal.realizedRoi ?? signal.unrealizedRoi ?? 0;

  return (
    <>
      <Navbar />
      <motion.div
        className="page-container signal-detail"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Breadcrumb */}
        <motion.div
          className="signal-detail-breadcrumb"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link to="/">Dashboard</Link>
          <ChevronRight size={14} className="signal-detail-breadcrumb-separator" />
          <span className="signal-detail-breadcrumb-current">{signal.symbol}</span>
        </motion.div>

        {/* Header */}
        <motion.div
          className="signal-detail-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="signal-detail-header-left">
            <div className={`signal-detail-symbol-icon signal-detail-symbol-icon--${isBuy ? 'buy' : 'sell'}`}>
              {signal.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="signal-detail-symbol">{signal.symbol}</div>
              <div
                className={`signal-detail-direction-badge signal-detail-direction-badge--${isBuy ? 'buy' : 'sell'}`}
              >
                {isBuy ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {signal.direction}
              </div>
            </div>
          </div>

          <div className="signal-detail-header-right">
            <StatusBadge status={signal.status} large />
            <Link to="/" className="signal-detail-back-btn">
              <ArrowLeft size={14} />
              Back
            </Link>
            <motion.button
              className="signal-detail-delete-btn"
              onClick={handleDelete}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 size={14} />
              Delete
            </motion.button>
          </div>
        </motion.div>

        {/* Gauge + Status */}
        <div className="signal-detail-center">
          <motion.div
            className="signal-detail-center-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="signal-detail-center-card-title">
              <TrendingUp size={14} style={{ marginRight: 6 }} />
              ROI Performance
            </div>
            <ROIGauge roi={roi} />
          </motion.div>

          <motion.div
            className="signal-detail-center-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="signal-detail-center-card-title">
              <Clock size={14} style={{ marginRight: 6 }} />
              {signal.status === SignalStatus.OPEN ? 'Time Remaining' : 'Signal Status'}
            </div>
            <div className="signal-detail-status-area">
              {signal.status === SignalStatus.OPEN ? (
                <CountdownTimer expiryTime={signal.expiryTime} large showLabels />
              ) : (
                <StatusBadge status={signal.status} large />
              )}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Current Price</div>
                <div style={{
                  fontSize: 28,
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-cyan)',
                }}>
                  {signal.currentPrice !== null ? `$${formatPrice(signal.currentPrice)}` : '—'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Price Progress */}
        <motion.div
          className="signal-detail-progress-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="signal-detail-section-title">
            <span className="signal-detail-section-title-dot" />
            Price Position
          </div>
          <PriceProgressBar
            stopLoss={signal.stopLoss}
            entryPrice={signal.entryPrice}
            currentPrice={signal.currentPrice}
            targetPrice={signal.targetPrice}
          />
        </motion.div>

        {/* Chart */}
        <div className="signal-detail-chart-section">
          <AnimatedChart
            entryPrice={signal.entryPrice}
            targetPrice={signal.targetPrice}
            stopLoss={signal.stopLoss}
            currentPrice={signal.currentPrice}
          />
        </div>

        {/* Info Grid */}
        <motion.div
          className="signal-detail-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="signal-detail-grid-item">
            <div className="signal-detail-grid-label">
              <DollarSign size={12} style={{ marginRight: 4 }} />
              Entry Price
            </div>
            <div className="signal-detail-grid-value signal-detail-grid-value--cyan">
              ${formatPrice(signal.entryPrice)}
            </div>
          </div>

          <div className="signal-detail-grid-item">
            <div className="signal-detail-grid-label">
              <Target size={12} style={{ marginRight: 4 }} />
              Target Price
            </div>
            <div className="signal-detail-grid-value signal-detail-grid-value--green">
              ${formatPrice(signal.targetPrice)}
            </div>
          </div>

          <div className="signal-detail-grid-item">
            <div className="signal-detail-grid-label">
              <Shield size={12} style={{ marginRight: 4 }} />
              Stop Loss
            </div>
            <div className="signal-detail-grid-value signal-detail-grid-value--red">
              ${formatPrice(signal.stopLoss)}
            </div>
          </div>

          <div className="signal-detail-grid-item">
            <div className="signal-detail-grid-label">
              <DollarSign size={12} style={{ marginRight: 4 }} />
              Current Price
            </div>
            <div className="signal-detail-grid-value signal-detail-grid-value--gold">
              {signal.currentPrice !== null ? `$${formatPrice(signal.currentPrice)}` : '—'}
            </div>
          </div>

          <div className="signal-detail-grid-item">
            <div className="signal-detail-grid-label">
              <Calendar size={12} style={{ marginRight: 4 }} />
              Entry Time
            </div>
            <div className="signal-detail-grid-value" style={{ fontSize: 14 }}>
              {formatDate(signal.entryTime)}
            </div>
          </div>

          <div className="signal-detail-grid-item">
            <div className="signal-detail-grid-label">
              <Clock size={12} style={{ marginRight: 4 }} />
              Expiry Time
            </div>
            <div className="signal-detail-grid-value" style={{ fontSize: 14 }}>
              {formatDate(signal.expiryTime)}
            </div>
          </div>

          <div className="signal-detail-grid-item">
            <div className="signal-detail-grid-label">
              <Calendar size={12} style={{ marginRight: 4 }} />
              Created At
            </div>
            <div className="signal-detail-grid-value" style={{ fontSize: 14 }}>
              {formatDate(signal.createdAt)}
            </div>
          </div>

          <div className="signal-detail-grid-item">
            <div className="signal-detail-grid-label">
              <TrendingUp size={12} style={{ marginRight: 4 }} />
              ROI
            </div>
            <div className={`signal-detail-grid-value ${roi > 0 ? 'signal-detail-grid-value--green' : roi < 0 ? 'signal-detail-grid-value--red' : ''}`}>
              {roi > 0 ? '+' : ''}{roi.toFixed(2)}%
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default SignalDetailPage;

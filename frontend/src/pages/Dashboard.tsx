import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, BarChart3, Zap, Target, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { signalApi } from '../services/api';
import { Signal, SignalStatus } from '../types';
import Navbar from '../components/Navbar';
import SignalTable from '../components/SignalTable';
import StatsCard from '../components/StatsCard';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSignals = useCallback(async () => {
    try {
      const data = await signalApi.getSignals();
      setSignals(data);
    } catch (err) {
      toast.error('Failed to fetch signals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 10000);
    return () => clearInterval(interval);
  }, [fetchSignals]);

  const stats = useMemo(() => {
    const total = signals.length;
    const active = signals.filter((s) => s.status === SignalStatus.OPEN).length;
    const closed = signals.filter((s) => s.status !== SignalStatus.OPEN);
    const hits = closed.filter((s) => s.status === SignalStatus.TARGET_HIT).length;
    const successRate = closed.length > 0 ? (hits / closed.length) * 100 : 0;
    const rois = signals
      .map((s) => s.realizedRoi ?? s.unrealizedRoi)
      .filter((r): r is number => r !== null);
    const avgRoi = rois.length > 0 ? rois.reduce((a, b) => a + b, 0) / rois.length : 0;

    return { total, active, successRate, avgRoi };
  }, [signals]);

  const handleDelete = async (id: string) => {
    try {
      await signalApi.deleteSignal(id);
      setSignals((prev) => prev.filter((s) => s.id !== id));
      toast.success('Signal deleted');
    } catch {
      toast.error('Failed to delete signal');
    }
  };

  return (
    <>
      <Navbar />
      <motion.div
        className="page-container dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="dashboard-header">
          <motion.div
            className="dashboard-header-row"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <h1 className="dashboard-title">
                Signal <span className="dashboard-title-accent">Dashboard</span>
              </h1>
              <p className="dashboard-subtitle">Track and manage your trading signals in real-time</p>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/create"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fff',
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 4px 16px rgba(0, 212, 255, 0.3)',
                  textDecoration: 'none',
                }}
              >
                <PlusCircle size={16} />
                New Signal
              </Link>
            </motion.div>
          </motion.div>

          <div className="dashboard-stats-grid">
            <StatsCard
              label="Total Signals"
              value={stats.total}
              icon={BarChart3}
              iconColor="cyan"
              delay={0}
            />
            <StatsCard
              label="Active Signals"
              value={stats.active}
              icon={Zap}
              iconColor="green"
              delay={0.1}
            />
            <StatsCard
              label="Success Rate"
              value={stats.successRate}
              suffix="%"
              decimals={1}
              icon={Target}
              iconColor="gold"
              delay={0.2}
            />
            <StatsCard
              label="Average ROI"
              value={stats.avgRoi}
              suffix="%"
              decimals={2}
              prefix={stats.avgRoi > 0 ? '+' : ''}
              icon={TrendingUp}
              iconColor="purple"
              delay={0.3}
            />
          </div>
        </div>

        <div className="dashboard-refresh-bar">
          <span className="dashboard-refresh-dot" />
          Live — Auto-refreshing every 10s
        </div>

        <SignalTable signals={signals} loading={loading} onDelete={handleDelete} />

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="dashboard-fab-wrapper"
          style={{ display: 'none' }}
        >
          <Link to="/create" className="dashboard-fab">
            <PlusCircle size={24} />
          </Link>
        </motion.div>
      </motion.div>

      {/* Mobile FAB */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
        style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 100 }}
      >
        <Link to="/create" className="dashboard-fab" style={{ display: 'flex' }}>
          <PlusCircle size={24} />
        </Link>
      </motion.div>
    </>
  );
};

export default Dashboard;

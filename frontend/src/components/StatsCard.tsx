import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import type { LucideIcon } from 'lucide-react';
import './StatsCard.css';

interface StatsCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  icon: LucideIcon;
  iconColor?: 'cyan' | 'green' | 'gold' | 'purple';
  delay?: number;
  accentColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  suffix,
  prefix,
  decimals = 0,
  icon: Icon,
  iconColor = 'cyan',
  delay = 0,
  accentColor,
}) => {
  const colorMap: Record<string, string> = {
    cyan: '#00d4ff',
    green: '#00ff88',
    gold: '#ffd700',
    purple: '#a855f7',
  };

  return (
    <motion.div
      className="stats-card"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, scale: 1.01 }}
      style={{ '--card-accent': accentColor || colorMap[iconColor] } as React.CSSProperties}
    >
      <div className={`stats-card-icon stats-card-icon--${iconColor}`}>
        <Icon size={20} />
      </div>
      <div className="stats-card-label">{label}</div>
      <div className="stats-card-value">
        {prefix}
        <CountUp end={value} decimals={decimals} duration={1.5} delay={delay} separator="," />
        {suffix && <span className="stats-card-suffix">{suffix}</span>}
      </div>
      <div
        className="stats-card-glow"
        style={{ background: colorMap[iconColor] }}
      />
    </motion.div>
  );
};

export default StatsCard;

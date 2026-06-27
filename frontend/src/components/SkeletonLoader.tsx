import React from 'react';
import { motion } from 'framer-motion';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  variant: 'table-row' | 'card' | 'detail-page';
  count?: number;
}

const SkeletonRow: React.FC<{ index: number }> = ({ index }) => (
  <motion.div
    className="skeleton-row"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.05 }}
  >
    <div className="skeleton skeleton-cell skeleton-cell--md" />
    <div className="skeleton skeleton-cell skeleton-cell--sm" />
    <div className="skeleton skeleton-cell skeleton-cell--md" />
    <div className="skeleton skeleton-cell skeleton-cell--md" />
    <div className="skeleton skeleton-cell skeleton-cell--md" />
    <div className="skeleton skeleton-cell skeleton-cell--md" />
    <div className="skeleton skeleton-cell skeleton-cell--sm" />
    <div className="skeleton skeleton-cell skeleton-cell--lg" />
  </motion.div>
);

const SkeletonCard: React.FC<{ index: number }> = ({ index }) => (
  <motion.div
    className="skeleton-card"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <div className="skeleton skeleton-card-header" />
    <div className="skeleton skeleton-card-body" />
    <div className="skeleton skeleton-card-footer" />
  </motion.div>
);

const SkeletonDetail: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="skeleton skeleton-detail-header" />
    <div className="skeleton skeleton-detail-gauge" />
    <div className="skeleton skeleton-detail-bar" />
    <div className="skeleton-detail-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton skeleton-detail-item" />
      ))}
    </div>
  </motion.div>
);

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant, count = 5 }) => {
  switch (variant) {
    case 'table-row':
      return (
        <>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonRow key={i} index={i} />
          ))}
        </>
      );
    case 'card':
      return (
        <>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </>
      );
    case 'detail-page':
      return <SkeletonDetail />;
    default:
      return null;
  }
};

export default SkeletonLoader;

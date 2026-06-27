import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import './ROIGauge.css';

interface ROIGaugeProps {
  roi: number;
  size?: number;
}

const ROIGauge: React.FC<ROIGaugeProps> = ({ roi, size = 260 }) => {
  const [animatedAngle, setAnimatedAngle] = useState(0);

  const clampedRoi = Math.max(-100, Math.min(100, roi));
  // Map -100..+100 to 0..180 degrees
  const targetAngle = ((clampedRoi + 100) / 200) * 180;

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedAngle(targetAngle), 100);
    return () => clearTimeout(timeout);
  }, [targetAngle]);

  const cx = size / 2;
  const cy = size / 2 + 10;
  const radius = size / 2 - 20;
  const strokeWidth = 12;
  const innerRadius = radius - strokeWidth / 2;

  // Arc path for the gauge background
  const describeArc = (startAngle: number, endAngle: number, r: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 180) * Math.PI) / 180;
    return {
      x: centerX + r * Math.cos(angleRad),
      y: centerY + r * Math.sin(angleRad),
    };
  };

  // Needle position
  const needleAngle = animatedAngle;
  const needleEnd = polarToCartesian(cx, cy, innerRadius - 10, needleAngle);

  const roiColor = roi > 0 ? '#00ff88' : roi < 0 ? '#ff3366' : '#ffd700';
  const roiClass = roi > 0 ? 'positive' : roi < 0 ? 'negative' : 'neutral';

  return (
    <motion.div
      className="roi-gauge"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg
        className="roi-gauge-svg"
        width={size}
        height={size / 2 + 30}
        viewBox={`0 0 ${size} ${size / 2 + 40}`}
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff3366" />
            <stop offset="35%" stopColor="#ff8c00" />
            <stop offset="50%" stopColor="#ffd700" />
            <stop offset="65%" stopColor="#88ff00" />
            <stop offset="100%" stopColor="#00ff88" />
          </linearGradient>
          <filter id="gaugeGlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d={describeArc(0, 180, innerRadius)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored arc */}
        <motion.path
          d={describeArc(0, 180, innerRadius)}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ opacity: 0.8 }}
        />

        {/* Glow arc */}
        <motion.path
          d={describeArc(0, 180, innerRadius)}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth + 6}
          strokeLinecap="round"
          filter="url(#gaugeGlow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ opacity: 0.25 }}
        />

        {/* Tick marks */}
        {Array.from({ length: 11 }).map((_, i) => {
          const angle = (i / 10) * 180;
          const outer = polarToCartesian(cx, cy, innerRadius + 8, angle);
          const inner = polarToCartesian(cx, cy, innerRadius + 3, angle);
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
            />
          );
        })}

        {/* Needle */}
        <motion.line
          x1={cx}
          y1={cy}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke={roiColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            filter: `drop-shadow(0 0 6px ${roiColor})`,
            transition: 'all 1s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={5} fill={roiColor} opacity={0.9}>
          <animate
            attributeName="r"
            values="4;6;4"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx={cx} cy={cy} r={3} fill="var(--bg-primary)" />

        {/* Labels */}
        <text x={20} y={cy + 20} fill="var(--text-muted)" fontSize={10} fontFamily="var(--font-mono)">
          -100%
        </text>
        <text x={size - 46} y={cy + 20} fill="var(--text-muted)" fontSize={10} fontFamily="var(--font-mono)">
          +100%
        </text>
      </svg>

      <div className={`roi-gauge-value roi-gauge-value--${roiClass}`}>
        <CountUp
          end={roi}
          decimals={2}
          duration={1.5}
          prefix={roi > 0 ? '+' : ''}
          suffix="%"
        />
      </div>
      <div className="roi-gauge-label">Return on Investment</div>
    </motion.div>
  );
};

export default ROIGauge;

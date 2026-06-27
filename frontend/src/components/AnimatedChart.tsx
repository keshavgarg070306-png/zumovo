import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './AnimatedChart.css';

interface AnimatedChartProps {
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  currentPrice: number | null;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip-custom">
        <div className="chart-tooltip-label">Price Level</div>
        <div className="chart-tooltip-value">
          ${payload[0].value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>
    );
  }
  return null;
};

const AnimatedChart: React.FC<AnimatedChartProps> = ({
  entryPrice,
  targetPrice,
  stopLoss,
  currentPrice,
}) => {
  const data = useMemo(() => {
    const cp = currentPrice ?? entryPrice;
    const range = targetPrice - stopLoss;
    const volatility = range * 0.06;
    const points: { index: number; price: number }[] = [];
    const numPoints = 30;

    let price = entryPrice;
    for (let i = 0; i <= numPoints; i++) {
      points.push({ index: i, price: parseFloat(price.toFixed(2)) });
      // Simulate gentle random walk toward current price
      const direction = cp > entryPrice ? 1 : -1;
      const progress = i / numPoints;
      const target = entryPrice + (cp - entryPrice) * progress;
      const noise = (Math.sin(i * 1.5) * 0.5 + Math.cos(i * 0.7) * 0.3) * volatility;
      price = target + noise;
      price = Math.max(stopLoss * 0.98, Math.min(targetPrice * 1.02, price));
    }

    return points;
  }, [entryPrice, targetPrice, stopLoss, currentPrice]);

  const minVal = Math.min(stopLoss, ...data.map((d) => d.price)) * 0.998;
  const maxVal = Math.max(targetPrice, ...data.map((d) => d.price)) * 1.002;

  return (
    <motion.div
      className="animated-chart-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="animated-chart-title">
        <span className="animated-chart-title-dot" />
        Price Visualization
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="index"
            tick={false}
            axisLine={{ stroke: 'var(--border-color)', strokeWidth: 2 }}
            tickLine={false}
          />
          <YAxis
            domain={[minVal, maxVal]}
            tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={65}
            tickFormatter={(val) => `$${val.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Stop Loss reference */}
          <ReferenceLine
            y={stopLoss}
            stroke="var(--accent-red)"
            strokeDasharray="5 3"
            strokeWidth={2}
            label={{
              value: 'SL',
              fill: 'var(--accent-red)',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              position: 'right',
            }}
          />

          {/* Entry reference */}
          <ReferenceLine
            y={entryPrice}
            stroke="var(--accent-cyan)"
            strokeDasharray="4 3"
            strokeWidth={2}
            label={{
              value: 'Entry',
              fill: 'var(--accent-cyan)',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              position: 'right',
            }}
          />

          {/* Target reference */}
          <ReferenceLine
            y={targetPrice}
            stroke="var(--accent-green)"
            strokeDasharray="5 3"
            strokeWidth={2}
            label={{
              value: 'TP',
              fill: 'var(--accent-green)',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              position: 'right',
            }}
          />

          <Area
            type="monotone"
            dataKey="price"
            stroke="var(--accent-purple)"
            strokeWidth={3}
            fill="url(#priceGradient)"
            animationDuration={1500}
            animationEasing="ease-out"
            dot={false}
            activeDot={{
              r: 6,
              fill: 'var(--accent-purple)',
              stroke: 'var(--border-color)',
              strokeWidth: 2.5,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default AnimatedChart;

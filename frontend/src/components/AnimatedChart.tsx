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
              <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="index"
            tick={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false}
          />
          <YAxis
            domain={[minVal, maxVal]}
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            width={65}
            tickFormatter={(val) => `$${val.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Stop Loss reference */}
          <ReferenceLine
            y={stopLoss}
            stroke="#ff3366"
            strokeDasharray="6 4"
            strokeWidth={1}
            label={{
              value: 'SL',
              fill: '#ff3366',
              fontSize: 10,
              fontFamily: 'JetBrains Mono',
              position: 'right',
            }}
          />

          {/* Entry reference */}
          <ReferenceLine
            y={entryPrice}
            stroke="#00d4ff"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: 'Entry',
              fill: '#00d4ff',
              fontSize: 10,
              fontFamily: 'JetBrains Mono',
              position: 'right',
            }}
          />

          {/* Target reference */}
          <ReferenceLine
            y={targetPrice}
            stroke="#00ff88"
            strokeDasharray="6 4"
            strokeWidth={1}
            label={{
              value: 'TP',
              fill: '#00ff88',
              fontSize: 10,
              fontFamily: 'JetBrains Mono',
              position: 'right',
            }}
          />

          <Area
            type="monotone"
            dataKey="price"
            stroke="#00d4ff"
            strokeWidth={2}
            fill="url(#priceGradient)"
            animationDuration={1500}
            animationEasing="ease-out"
            dot={false}
            activeDot={{
              r: 5,
              fill: '#00d4ff',
              stroke: '#0a0e17',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default AnimatedChart;

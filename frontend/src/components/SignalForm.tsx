import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowUpRight, ArrowDownRight, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { SignalDirection } from '../types';
import type { SignalRequest } from '../types';
import './SignalForm.css';

interface SignalFormProps {
  onSubmit: (data: SignalRequest) => Promise<void>;
}

const SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT',
  'SOLUSDT', 'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT',
  'LINKUSDT', 'LTCUSDT', 'UNIUSDT', 'ATOMUSDT', 'NEARUSDT',
];

const SignalForm: React.FC<SignalFormProps> = ({ onSubmit }) => {
  const [direction, setDirection] = useState<SignalDirection>(SignalDirection.BUY);
  const [symbol, setSymbol] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredSymbols = useMemo(() => {
    if (!symbol) return SYMBOLS;
    return SYMBOLS.filter((s) => s.toLowerCase().includes(symbol.toLowerCase()));
  }, [symbol]);

  const priceValid = useMemo(() => {
    const ep = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(targetPrice);
    if (isNaN(ep) || isNaN(sl) || isNaN(tp)) return null;

    if (direction === SignalDirection.BUY) {
      return sl < ep && ep < tp;
    } else {
      return tp < ep && ep < sl;
    }
  }, [entryPrice, stopLoss, targetPrice, direction]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!symbol.trim()) newErrors.symbol = 'Symbol is required';
    if (!entryPrice || isNaN(parseFloat(entryPrice)) || parseFloat(entryPrice) <= 0)
      newErrors.entryPrice = 'Valid entry price required';
    if (!stopLoss || isNaN(parseFloat(stopLoss)) || parseFloat(stopLoss) <= 0)
      newErrors.stopLoss = 'Valid stop loss required';
    if (!targetPrice || isNaN(parseFloat(targetPrice)) || parseFloat(targetPrice) <= 0)
      newErrors.targetPrice = 'Valid target price required';
    if (!entryTime) newErrors.entryTime = 'Entry time required';
    if (!expiryTime) newErrors.expiryTime = 'Expiry time required';

    if (priceValid === false) {
      if (direction === SignalDirection.BUY) {
        newErrors.priceOrder = 'BUY: Stop Loss < Entry < Target';
      } else {
        newErrors.priceOrder = 'SELL: Target < Entry < Stop Loss';
      }
    }

    if (entryTime && expiryTime && new Date(expiryTime) <= new Date(entryTime)) {
      newErrors.expiryTime = 'Expiry must be after entry time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        symbol: symbol.toUpperCase(),
        direction,
        entryPrice: parseFloat(entryPrice),
        stopLoss: parseFloat(stopLoss),
        targetPrice: parseFloat(targetPrice),
        entryTime: new Date(entryTime).toISOString(),
        expiryTime: new Date(expiryTime).toISOString(),
      });
      setSuccess(true);
    } catch (err: any) {
      setErrors({ submit: err?.response?.data?.message || 'Failed to create signal' });
    } finally {
      setLoading(false);
    }
  };

  const isBuy = direction === SignalDirection.BUY;

  return (
    <motion.div
      className="signal-form-card"
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        '--form-accent': isBuy ? 'var(--accent-green)' : 'var(--accent-red)',
      } as React.CSSProperties}
    >
      <AnimatePresence>
        {success && (
          <motion.div
            className="signal-form-success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: 'spring' }}
          >
            <motion.div
              className="signal-form-success-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
            >
              <CheckCircle size={32} />
            </motion.div>
            <div className="signal-form-success-text">Signal Created!</div>
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="signal-form-title">Create Signal</h2>
      <p className="signal-form-subtitle">Set up a new trading signal to track</p>

      <form onSubmit={handleSubmit}>
        {/* Direction Toggle */}
        <div className="signal-form-direction">
          <motion.button
            type="button"
            className={`signal-form-direction-btn ${direction === SignalDirection.BUY ? 'active--buy' : ''}`}
            onClick={() => setDirection(SignalDirection.BUY)}
            whileTap={{ scale: 0.97 }}
          >
            <ArrowUpRight size={16} />
            BUY / LONG
          </motion.button>
          <motion.button
            type="button"
            className={`signal-form-direction-btn ${direction === SignalDirection.SELL ? 'active--sell' : ''}`}
            onClick={() => setDirection(SignalDirection.SELL)}
            whileTap={{ scale: 0.97 }}
          >
            <ArrowDownRight size={16} />
            SELL / SHORT
          </motion.button>
        </div>

        {/* Symbol */}
        <div className="signal-form-field">
          <label className="signal-form-label">Symbol</label>
          <input
            type="text"
            className={`signal-form-input ${errors.symbol ? 'signal-form-input--error' : ''}`}
            placeholder="e.g. BTCUSDT"
            value={symbol}
            onChange={(e) => {
              setSymbol(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          <AnimatePresence>
            {showSuggestions && filteredSymbols.length > 0 && (
              <motion.div
                className="signal-form-suggestions"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
              >
                {filteredSymbols.slice(0, 8).map((s) => (
                  <div
                    key={s}
                    className="signal-form-suggestion-item"
                    onMouseDown={() => {
                      setSymbol(s);
                      setShowSuggestions(false);
                    }}
                  >
                    {s}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {errors.symbol && (
            <motion.div className="signal-form-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
              <AlertCircle size={12} /> {errors.symbol}
            </motion.div>
          )}
        </div>

        {/* Entry Price */}
        <div className="signal-form-field">
          <label className="signal-form-label">Entry Price</label>
          <input
            type="number"
            step="any"
            className={`signal-form-input ${errors.entryPrice ? 'signal-form-input--error' : ''}`}
            placeholder="0.00"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
          />
          {errors.entryPrice && (
            <motion.div className="signal-form-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AlertCircle size={12} /> {errors.entryPrice}
            </motion.div>
          )}
        </div>

        {/* Stop Loss + Target */}
        <div className="signal-form-row">
          <div className="signal-form-field">
            <label className="signal-form-label">Stop Loss</label>
            <input
              type="number"
              step="any"
              className={`signal-form-input ${errors.stopLoss ? 'signal-form-input--error' : ''}`}
              placeholder="0.00"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
            />
            {errors.stopLoss && (
              <motion.div className="signal-form-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <AlertCircle size={12} /> {errors.stopLoss}
              </motion.div>
            )}
          </div>
          <div className="signal-form-field">
            <label className="signal-form-label">Target Price</label>
            <input
              type="number"
              step="any"
              className={`signal-form-input ${errors.targetPrice ? 'signal-form-input--error' : ''}`}
              placeholder="0.00"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
            />
            {errors.targetPrice && (
              <motion.div className="signal-form-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <AlertCircle size={12} /> {errors.targetPrice}
              </motion.div>
            )}
          </div>
        </div>

        {/* Price validation hint */}
        {priceValid !== null && (
          <motion.div
            className={`signal-form-price-hint ${priceValid ? 'signal-form-price-hint--valid' : 'signal-form-price-hint--invalid'}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
          >
            {priceValid ? (
              <>
                <CheckCircle size={14} />
                Price ordering is valid
              </>
            ) : (
              <>
                <AlertCircle size={14} />
                {isBuy ? 'BUY requires: SL < Entry < Target' : 'SELL requires: TP < Entry < SL'}
              </>
            )}
          </motion.div>
        )}
        {errors.priceOrder && (
          <motion.div className="signal-form-error" style={{ marginTop: 8 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AlertCircle size={12} /> {errors.priceOrder}
          </motion.div>
        )}

        {/* Entry Time + Expiry Time */}
        <div className="signal-form-row" style={{ marginTop: 20 }}>
          <div className="signal-form-field">
            <label className="signal-form-label">Entry Time</label>
            <input
              type="datetime-local"
              className={`signal-form-input ${errors.entryTime ? 'signal-form-input--error' : ''}`}
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
            />
            {errors.entryTime && (
              <motion.div className="signal-form-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <AlertCircle size={12} /> {errors.entryTime}
              </motion.div>
            )}
          </div>
          <div className="signal-form-field">
            <label className="signal-form-label">Expiry Time</label>
            <input
              type="datetime-local"
              className={`signal-form-input ${errors.expiryTime ? 'signal-form-input--error' : ''}`}
              value={expiryTime}
              onChange={(e) => setExpiryTime(e.target.value)}
            />
            {errors.expiryTime && (
              <motion.div className="signal-form-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <AlertCircle size={12} /> {errors.expiryTime}
              </motion.div>
            )}
          </div>
        </div>

        {/* Submit error */}
        {errors.submit && (
          <motion.div
            className="signal-form-error"
            style={{ marginTop: 16, fontSize: 13 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertCircle size={14} /> {errors.submit}
          </motion.div>
        )}

        {/* Submit button */}
        <motion.button
          type="submit"
          className={`signal-form-submit ${isBuy ? 'signal-form-submit--buy' : 'signal-form-submit--sell'}`}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <span className="signal-form-spinner" />
          ) : (
            <>
              <Send size={16} />
              Create {isBuy ? 'Buy' : 'Sell'} Signal
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default SignalForm;

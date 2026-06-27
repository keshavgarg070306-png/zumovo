export enum SignalDirection {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum SignalStatus {
  OPEN = 'OPEN',
  TARGET_HIT = 'TARGET_HIT',
  STOPLOSS_HIT = 'STOPLOSS_HIT',
  EXPIRED = 'EXPIRED',
}

export interface Signal {
  id: string;
  symbol: string;
  direction: SignalDirection;
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  entryTime: string;
  expiryTime: string;
  createdAt: string;
  status: SignalStatus;
  realizedRoi: number | null;
  currentPrice: number | null;
  unrealizedRoi: number | null;
}

export interface SignalRequest {
  symbol: string;
  direction: string;
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  entryTime: string;
  expiryTime: string;
}

export interface SignalStatusResponse {
  id: string;
  symbol: string;
  status: SignalStatus;
  currentPrice: number;
  roi: number;
}

export interface AuthResponse {
  token: string;
  username: string;
  expiresIn: number;
}

export interface DashboardStats {
  totalSignals: number;
  activeSignals: number;
  successRate: number;
  averageRoi: number;
}

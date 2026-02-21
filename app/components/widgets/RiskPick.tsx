"use client";

import useSWR from "swr";
import { TrendingUp, TrendingDown, AlertTriangle, Wallet, Shield, AlertCircle } from "lucide-react";
import Widget from "../Widget";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UpbitAltcoinData {
  success: boolean;
  data: Array<{
    symbol: string;
    name: string;
    market: string;
    price: number;
    change24h: number;
    volume24h: number;
    high24h: number;
    low24h: number;
    change: string;
  }>;
  fallback?: boolean;
  source: string;
  lastUpdated: string;
}

interface RiskPickData {
  portfolio: {
    totalInvested: number;
    currentValue: number;
    pnlPercent: number;
    riskLimit: number;
    riskLimitReached: boolean;
  };
  principles: string[];
}

// 알트코인 시그널 분석 (간단한 규칙 기반)
function analyzeSignal(change24h: number, volume24h: number): {
  signal: "accumulate" | "watch" | "avoid";
  reason: string;
  position: string;
} {
  if (change24h > 15) {
    return {
      signal: "watch",
      reason: "급등 후 조정 구간, 고점 근처",
      position: "관망 중",
    };
  } else if (change24h > 5 && change24h <= 15) {
    return {
      signal: "accumulate",
      reason: "상승세 유지 중, 거래량 증가",
      position: "소량 분할 매수",
    };
  } else if (change24h >= -5 && change24h <= 5) {
    return {
      signal: "watch",
      reason: "횡보 중, 방향성 대기",
      position: "관망 중",
    };
  } else if (change24h >= -15 && change24h < -5) {
    return {
      signal: "accumulate",
      reason: "하락 후 반등 시도 구간",
      position: "DCA 고려",
    };
  } else {
    return {
      signal: "avoid",
      reason: "급락세, 추가 하락 가능성",
      position: "매수 보류",
    };
  }
}

function SignalBadge({ signal }: { signal: string }) {
  const colors = {
    accumulate: "bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/30",
    watch: "bg-[var(--warning)]/20 text-[var(--warning)] border-[var(--warning)]/30",
    avoid: "bg-[var(--error)]/20 text-[var(--error)] border-[var(--error)]/30",
  };

  const labels = {
    accumulate: "🟢",
    watch: "🟡",
    avoid: "🔴",
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${colors[signal as keyof typeof colors] || colors.watch}`}>
      {labels[signal as keyof typeof labels] || "🟡"}
    </span>
  );
}

const mockRiskData: RiskPickData = {
  portfolio: {
    totalInvested: 1000000,
    currentValue: 870000,
    pnlPercent: -13,
    riskLimit: 20,
    riskLimitReached: false,
  },
  principles: [
    "리스크 한도: 총 자산의 20%",
    "DCA 권장: 정기적 소액 투자",
    "손절 라인: -20% 도달 시 재검토",
  ],
};

export default function RiskPick() {
  // 업비트 API에서 알트코인 데이터 조회
  const { data: altcoinData, error: altcoinError } = useSWR<UpbitAltcoinData>(
    "/api/crypto/upbit?type=altcoins",
    fetcher,
    { refreshInterval: 30000 }
  );

  const isLoading = !altcoinData;
  const isMockData = altcoinData?.fallback || altcoinData?.source === "mock";

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `₩${price.toFixed(3)}`;
    }
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // 알트코인 데이터에 시그널 분석 추가
  const todaysPick = altcoinData?.data.map((coin) => {
    const analysis = analyzeSignal(coin.change24h, coin.volume24h);
    return {
      symbol: coin.symbol,
      name: coin.name,
      price: coin.price,
      change24h: coin.change24h,
      signal: analysis.signal,
      reason: analysis.reason,
      position: analysis.position,
    };
  }) || [];

  return (
    <Widget 
      title="Risk Pick" 
      icon="🎲"
      badge="⚠️ HIGH RISK"
      loading={isLoading}
    >
      <div className="space-y-4">
        {/* Today's Picks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-[var(--text-secondary)]">
              Today&apos;s Picks
            </h3>
            {isMockData && (
              <span className="px-2 py-0.5 text-xs bg-[var(--warning)]/20 text-[var(--warning)] rounded-full">
                Mock
              </span>
            )}
            {altcoinData?.source === "upbit" && (
              <span className="text-xs text-[var(--text-secondary)]">
                업비트
              </span>
            )}
          </div>
          <div className="space-y-2">
            {todaysPick.map((pick, index) => (
              <div 
                key={pick.symbol}
                className="p-3 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-subtle)]/80 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {pick.symbol}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {pick.name}
                    </span>
                  </div>
                  <SignalBadge signal={pick.signal} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-primary)]">
                    {formatPrice(pick.price)}
                  </span>
                  <span className={`text-sm font-medium ${
                    pick.change24h >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"
                  }`}>
                    {pick.change24h >= 0 ? "+" : ""}{pick.change24h}%
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {pick.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-subtle)]"></div>

        {/* Portfolio Summary */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-[var(--text-secondary)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Portfolio Summary
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2 bg-[var(--bg-elevated)] rounded">
              <div className="text-xs text-[var(--text-secondary)]">Invested</div>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {formatCurrency(mockRiskData.portfolio.totalInvested)}
              </div>
            </div>
            <div className="p-2 bg-[var(--bg-elevated)] rounded">
              <div className="text-xs text-[var(--text-secondary)]">Current</div>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {formatCurrency(mockRiskData.portfolio.currentValue)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-[var(--bg-elevated)] rounded mb-2">
            <span className="text-sm text-[var(--text-secondary)]">P&L</span>
            <span className={`text-sm font-bold ${
              mockRiskData.portfolio.pnlPercent >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"
            }`}>
              {`${mockRiskData.portfolio.pnlPercent > 0 ? "+" : ""}${mockRiskData.portfolio.pnlPercent}%`}
            </span>
          </div>
          
          {/* Risk Limit Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Risk Limit</span>
              <span className="text-[var(--text-primary)]">
                {`${Math.abs(mockRiskData.portfolio.pnlPercent)}/${mockRiskData.portfolio.riskLimit}%`}
              </span>
            </div>
            <div className="h-2 bg-[var(--border-subtle)] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  Math.abs(mockRiskData.portfolio.pnlPercent) > mockRiskData.portfolio.riskLimit 
                    ? "bg-[var(--error)]" 
                    : Math.abs(mockRiskData.portfolio.pnlPercent) > mockRiskData.portfolio.riskLimit * 0.5
                    ? "bg-[var(--warning)]"
                    : "bg-[var(--success)]"
                }`}
                style={{ 
                  width: `${Math.min((Math.abs(mockRiskData.portfolio.pnlPercent) / mockRiskData.portfolio.riskLimit) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {Math.abs(mockRiskData.portfolio.pnlPercent) <= mockRiskData.portfolio.riskLimit ? (
                <>
                  <span className="text-[var(--success)]">🟢</span>
                  <span className="text-[var(--success)]">Safe (within limit)</span>
                </>
              ) : (
                <>
                  <span className="text-[var(--error)]">🔴</span>
                  <span className="text-[var(--error)]">Risk limit reached!</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-subtle)]"></div>

        {/* Error Message */}
        {altcoinError && (
          <div className="flex items-center gap-2 p-2 bg-[var(--error)]/10 rounded-lg text-xs text-[var(--error)]">
            <AlertCircle className="w-4 h-4" />
            <span>알트코인 데이터를 불러올 수 없습니다</span>
          </div>
        )}

        {/* Principles */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-[var(--text-secondary)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Principles
            </span>
          </div>
          <ul className="space-y-1">
            {mockRiskData.principles.map((principle, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                <span className="text-[var(--accent-mango)]">•</span>
                {principle}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Widget>
  );
}

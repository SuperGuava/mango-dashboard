"use client";

import useSWR from "swr";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import Widget from "../Widget";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UpbitAltcoinData {
  success: boolean;
  data: Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
  }>;
  lastUpdated: string;
}

export default function RiskPick() {
  const [showAll, setShowAll] = useState(false);
  
  const { data: altcoinData, error: altcoinError } = useSWR<UpbitAltcoinData>(
    "/api/crypto/upbit?type=altcoins",
    fetcher,
    { refreshInterval: 30000 }
  );

  const isLoading = !altcoinData;
  
  // Top 3만 표시 (또는 전체)
  const coins = altcoinData?.data || [];
  const displayCoins = showAll ? coins : coins.slice(0, 3);

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

  return (
    <Widget 
      title="Risk Pick" 
      icon="🎲"
      badge="⚠️ HIGH RISK"
      mangoPick="소액으로 분산 투자하세요"
      loading={isLoading}
    >
      <div className="space-y-4">
        {/* Top 3 코인 리스트 */}
        <div className="space-y-3">
          {displayCoins.map((coin) => {
            const isPositive = coin.change24h >= 0;
            return (
              <div 
                key={coin.symbol}
                className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-xl hover:bg-[var(--bg-elevated)]/80 transition-colors"
              >
                {/* 이름 */}
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-[var(--text-primary)]">
                    {coin.symbol}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {coin.name}
                  </span>
                </div>
                
                {/* 가격 + 변동률 */}
                <div className="text-right">
                  <div className="text-base font-semibold text-[var(--text-primary)] mb-0.5">
                    {formatPrice(coin.price)}
                  </div>
                  <div className={`text-sm font-medium ${
                    isPositive ? "text-[var(--success)]" : "text-[var(--error)]"
                  }`}>
                    {isPositive ? "+" : ""}{coin.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 전체 보기 버튼 */}
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg transition-colors text-sm font-medium"
        >
          {showAll ? "접기" : "전체 보기"}
          <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? "rotate-90" : ""}`} />
        </button>

        {/* 에러 메시지 */}
        {altcoinError && (
          <div className="text-sm text-[var(--error)] text-center">
            데이터를 불러올 수 없습니다
          </div>
        )}
      </div>
    </Widget>
  );
}

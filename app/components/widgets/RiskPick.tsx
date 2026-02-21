"use client";

import useSWR from "swr";
import { TrendingUp, Star, ChevronRight, Sparkles } from "lucide-react";
import Widget from "../Widget";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CoinData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  isPick?: boolean;
}

interface UpbitAltcoinData {
  success: boolean;
  data: CoinData[];
  lastUpdated: string;
}

// 망고's Pick - 추천 알트코인
const mangoPicks = [
  { symbol: "MANGO", name: "Mango Token", price: 0.0, change24h: 0, isPick: true },
  { symbol: "SOL", name: "Solana", price: 0, change24h: 0, isPick: true },
  { symbol: "LINK", name: "Chainlink", price: 0, change24h: 0, isPick: true },
];

export default function RiskPick() {
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState<"top" | "pick">("top");
  
  const { data: altcoinData, error: altcoinError } = useSWR<UpbitAltcoinData>(
    "/api/crypto/upbit?type=altcoins",
    fetcher,
    { refreshInterval: 30000 }
  );

  const isLoading = !altcoinData;
  
  // 인기 알트코인 (BTC, ETH, XRP, DOGE 등)
  const popularCoins = altcoinData?.data || [];
  
  // Top 3는 인기 + 추천 혼합
  const mixedTop3 = [
    popularCoins[0], // BTC or top coin
    { ...mangoPicks[0], isPick: true }, // 망고's Pick
    popularCoins[1], // ETH or second coin
  ].filter(Boolean);

  // 전체 목록 - 인기 + 추천 섞기
  const allCoins = [
    ...(popularCoins.slice(0, 4) || []),
    ...mangoPicks.slice(1),
    ...(popularCoins.slice(4) || []),
  ];

  const displayCoins = showAll ? allCoins : mixedTop3;

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
        {/* 탭 전환 */}
        <div className="flex gap-2 p-1 bg-[var(--bg-primary)] rounded-lg">
          <button
            onClick={() => setActiveTab("top")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "top" 
                ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]" 
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Top Coins
          </button>
          <button
            onClick={() => setActiveTab("pick")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "pick" 
                ? "bg-[var(--accent-mango)]/20 text-[var(--accent-mango)]" 
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Star className="w-4 h-4" />
            망고's Pick
          </button>
        </div>

        {/* 망고's Pick 섹션 */}
        {activeTab === "pick" && (
          <div className="p-4 bg-[var(--accent-mango)]/10 border border-[var(--accent-mango)]/30 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[var(--accent-mango)]" />
              <span className="text-sm font-bold text-[var(--accent-mango)]">망고's Pick</span>
            </div>
            <div className="space-y-2">
              {mangoPicks.map((pick) => (
                <div 
                  key={pick.symbol}
                  className="flex items-center justify-between p-3 bg-[var(--bg-elevated)] rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥭</span>
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">{pick.symbol}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{pick.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      {pick.price > 0 ? formatPrice(pick.price) : "조회 중..."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-[var(--text-secondary)] text-center">
              망고가 선정한 잠재력 있는 알트코인
            </div>
          </div>
        )}

        {/* 코인 리스트 */}
        {activeTab === "top" && (
          <div className="space-y-3">
            {displayCoins.map((coin, index) => {
              if (!coin) return null;
              const isPositive = (coin.change24h || 0) >= 0;
              const isMangoPick = coin.isPick;
              
              return (
                <div 
                  key={`${coin.symbol}-${index}`}
                  className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                    isMangoPick 
                      ? "bg-[var(--accent-mango)]/10 border border-[var(--accent-mango)]/30" 
                      : "bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)]/80"
                  }`}
                >
                  {/* 이름 */}
                  <div className="flex items-center gap-3">
                    {isMangoPick && <span className="text-lg">🥭</span>}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[var(--text-primary)]">
                          {coin.symbol}
                        </span>
                        {isMangoPick && (
                          <span className="text-xs px-2 py-0.5 bg-[var(--accent-mango)]/20 text-[var(--accent-mango)] rounded-full">
                            Pick
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {coin.name}
                      </span>
                    </div>
                  </div>
                  
                  {/* 가격 + 변동률 */}
                  <div className="text-right">
                    <div className="text-base font-semibold text-[var(--text-primary)] mb-0.5">
                      {coin.price > 0 ? formatPrice(coin.price) : "--"}
                    </div>
                    {coin.change24h !== undefined && coin.change24h !== 0 && (
                      <div className={`text-sm font-medium ${
                        isPositive ? "text-[var(--success)]" : "text-[var(--error)]"
                      }`}>
                        {isPositive ? "+" : ""}{coin.change24h.toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 전체 보기 버튼 */}
        {activeTab === "top" && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg transition-colors text-sm font-medium"
          >
            {showAll ? "접기" : "전체 보기"}
            <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? "rotate-90" : ""}`} />
          </button>
        )}

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

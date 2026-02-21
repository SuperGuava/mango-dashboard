"use client";

import useSWR from "swr";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import Widget from "../Widget";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UpbitBTCData {
  success: boolean;
  data: {
    market: string;
    price: number;
    change24h: number;
    currency: string;
  };
  lastUpdated: string;
}

export default function Crypto101() {
  const { data: btcData, error: btcError } = useSWR<UpbitBTCData>(
    "/api/crypto/upbit?type=btc",
    fetcher,
    { refreshInterval: 30000 }
  );

  const isLoading = !btcData;
  const btc = btcData?.data;
  const isPositive = (btc?.change24h || 0) >= 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Widget 
      title="Crypto 101" 
      icon="📚"
      mangoPick={isPositive ? "지금 BTC 조금씩 모을 때" : "하락장에서 기회를 찾아보세요"}
      loading={isLoading}
    >
      <div className="flex flex-col items-center py-2">
        {/* BTC 대형 가격 */}
        <div className="text-center mb-6">
          <div className="text-sm text-[var(--text-secondary)] mb-2">Bitcoin (BTC)</div>
          <div className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            {btc ? formatPrice(btc.price) : "--"}
          </div>
        </div>

        {/* 변동률만 표시 */}
        {btc && (
          <div className={`flex items-center gap-2 text-xl font-semibold mb-6 ${
            isPositive ? "text-[var(--success)]" : "text-[var(--error)]"
          }`}>
            {isPositive ? (
              <TrendingUp className="w-6 h-6" />
            ) : (
              <TrendingDown className="w-6 h-6" />
            )}
            <span>{isPositive ? "+" : ""}{btc.change24h.toFixed(2)}%</span>
            <span className="text-sm text-[var(--text-secondary)] font-normal">(24h)</span>
          </div>
        )}

        {/* 더보기 버튼 - 업비트 바로가기 */}
        <a
          href="https://upbit.com/exchange?code=CRIX.UPBIT.KRW-BTC"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg transition-colors text-sm font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          업비트에서 더보기
        </a>

        {/* 에러 메시지 */}
        {btcError && (
          <div className="mt-4 text-sm text-[var(--error)]">
            데이터를 불러올 수 없습니다
          </div>
        )}
      </div>
    </Widget>
  );
}

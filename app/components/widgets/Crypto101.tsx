"use client";

import useSWR from "swr";
import { TrendingUp, TrendingDown, BookOpen, HelpCircle, AlertCircle } from "lucide-react";
import Widget from "../Widget";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UpbitBTCData {
  success: boolean;
  data: {
    market: string;
    price: number;
    change24h: number;
    currency: string;
    volume24h: number;
    high24h: number;
    low24h: number;
    openingPrice: number;
    prevClosingPrice: number;
    change: string;
    highest52w: number;
    lowest52w: number;
  };
  fallback?: boolean;
  source: string;
  lastUpdated: string;
}

interface CryptoEducationData {
  themeOfMonth: {
    concept: string;
    description: string;
    discussionQuestion: string;
  };
  vocabulary: {
    word: string;
    definition: string;
    example: string;
  };
}

const mockEducationData: CryptoEducationData = {
  themeOfMonth: {
    concept: "수요와 공급",
    description: "왜 비트코인은 2,100만 개만 있을까요?",
    discussionQuestion: "친구가 생일선물로 받은 사탕이 100개밖에 없다면, 가격이 어떻게 될 것 같아요?",
  },
  vocabulary: {
    word: "시가총액",
    definition: "모든 코인의 가격 × 개수를 더한 값",
    example: "비트코인 시가총액은 약 1,500조 원",
  },
};

export default function Crypto101() {
  // 업비트 API에서 BTC 데이터 조회
  const { data: btcData, error: btcError } = useSWR<UpbitBTCData>(
    "/api/crypto/upbit?type=btc",
    fetcher,
    { refreshInterval: 30000 }
  );

  const isLoading = !btcData;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e12) {
      return `₩${(volume / 1e12).toFixed(2)}T`;
    } else if (volume >= 1e9) {
      return `₩${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `₩${(volume / 1e6).toFixed(2)}M`;
    }
    return `₩${volume.toLocaleString()}`;
  };

  const btc = btcData?.data;
  const isMockData = btcData?.fallback || btcData?.source === "mock";

  return (
    <Widget 
      title="Crypto 101" 
      icon="🎓"
      badge="👶"
      loading={isLoading}
    >
      <div className="space-y-4">
        {/* BTC Price */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="text-3xl font-bold text-[var(--text-primary)]">
              {btc ? formatPrice(btc.price) : "--"}
            </div>
            {isMockData && (
              <span className="px-2 py-0.5 text-xs bg-[var(--warning)]/20 text-[var(--warning)] rounded-full">
                Mock
              </span>
            )}
          </div>
          <div className="text-sm text-[var(--text-secondary)] mt-1">
            BTC / KRW {btcData?.source === "upbit" && "• 업비트"}
          </div>
          {btc && (
            <div className={`flex items-center justify-center gap-1 mt-2 text-sm font-medium ${
              btc.change24h >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"
            }`}>
              {btc.change24h >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{btc.change24h >= 0 ? "+" : ""}{btc.change24h.toFixed(2)}% (24h)</span>
            </div>
          )}
          
          {/* 추가 정보: 24시간 고가/저가 */}
          {btc && (
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-[var(--text-secondary)]">
              <div>
                <span className="text-[var(--text-secondary)]">고가 </span>
                <span className="text-[var(--error)]">{formatPrice(btc.high24h)}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">저가 </span>
                <span className="text-[var(--success)]">{formatPrice(btc.low24h)}</span>
              </div>
            </div>
          )}
          
          {/* 거래대금 */}
          {btc && (
            <div className="mt-2 text-xs text-[var(--text-secondary)]">
              24시간 거래대금: <span className="font-medium text-[var(--text-primary)]">{formatVolume(btc.volume24h)}</span>
            </div>
          )}
          
          {/* 에러 메시지 */}
          {btcError && (
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-[var(--error)]">
              <AlertCircle className="w-3 h-3" />
              <span>데이터를 불러올 수 없습니다</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-subtle)]"></div>

        {/* Monthly Theme */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-xs font-medium bg-[var(--accent-mango)]/20 text-[var(--accent-mango)] rounded-full">
              {new Date().toLocaleString('ko-KR', { month: 'long' })} Theme
            </span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {mockEducationData.themeOfMonth.concept}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {mockEducationData.themeOfMonth.description}
          </p>
        </div>

        {/* Discussion Question */}
        <div className="p-3 bg-[var(--bg-elevated)] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-[var(--accent-mango)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Today&apos;s Question
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] italic">
            &ldquo;{mockEducationData.themeOfMonth.discussionQuestion}&rdquo;
          </p>
        </div>

        {/* Vocabulary Tooltip */}
        <div className="flex items-center justify-between p-3 bg-[var(--bg-elevated)] rounded-lg group cursor-help relative">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--info)]" />
            <span className="text-sm text-[var(--text-primary)]">
              {mockEducationData.vocabulary.word}
            </span>
          </div>
          <HelpCircle className="w-4 h-4 text-[var(--text-secondary)]" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            <div className="text-sm text-[var(--text-primary)] font-medium">
              {mockEducationData.vocabulary.word}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">
              {mockEducationData.vocabulary.definition}
            </div>
            <div className="text-xs text-[var(--accent-mango)] mt-1">
              예: {mockEducationData.vocabulary.example}
            </div>
          </div>
        </div>
      </div>
    </Widget>
  );
}

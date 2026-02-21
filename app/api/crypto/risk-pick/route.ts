import { NextResponse } from "next/server";

export async function GET() {
  // Mock data for risk pick
  return NextResponse.json({
    marketOverview: {
      btc: {
        price: 42500000,
        change24h: 2.3,
        trend: "bullish",
      },
    },
    todaysPick: [
      {
        symbol: "ARKM",
        name: "Arkham",
        price: 1250,
        change24h: 18.5,
        signal: "watch",
        reason: "'AI x Crypto' 테마 급등 후 조정 구간",
        position: "관망 중",
      },
      {
        symbol: "BONK",
        name: "Bonk",
        price: 0.025,
        change24h: -5.2,
        signal: "accumulate",
        reason: "밈코인 반등 시도, 거래량 3배 급증",
        position: "소량 DCA 중",
      },
    ],
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
    lastUpdated: new Date().toISOString(),
  });
}

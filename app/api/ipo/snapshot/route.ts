import { NextResponse } from "next/server";

export async function GET() {
  // Mock data for IPO snapshot
  return NextResponse.json({
    indices: {
      kospi: {
        value: 2580.12,
        change: 20.15,
        changePercent: 0.8,
        volume: 820000000000,
      },
      kosdaq: {
        value: 820.45,
        change: -2.45,
        changePercent: -0.3,
        volume: 310000000000,
      },
    },
    majorCompanies: [
      { name: "삼성전자", code: "005930", price: 58200, change: -0.5 },
      { name: "SK하이닉스", code: "000660", price: 182500, change: 2.3 },
      { name: "현대차", code: "005380", price: 245000, change: 1.2 },
      { name: "카카오", code: "035720", price: 42300, change: -1.8 },
      { name: "네이버", code: "035420", price: 212000, change: 0.3 },
      { name: "LG에너지솔루션", code: "373220", price: 432000, change: -0.9 },
    ],
    mangoPick: {
      company: "현대차",
      code: "005380",
      price: 245000,
      high52w: 306000,
      low52w: 198000,
      reasons: [
        "전기차 수출 증가세 (1월 YoY +45%)",
        "4분기 실적 시장 전망 상회",
        "배당수익률 3.2% (안정적)",
      ],
      metrics: {
        per: 8.5,
        targetPrice: 300000,
        dividend: 3.2,
        vsHigh52w: -20,
      },
      risk: "원화 강세 시 수출 타격",
    },
    pipeline: {
      preListing: 12,      // 상장예비
      demandForecast: 3,   // 수요예측
      subscription: 1,     // 공모청약
    },
    recentDisclosures: [
      {
        company: "삼성전자",
        type: "분기보고서",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        url: "#",
      },
      {
        company: "카카오",
        type: "주주총회",
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        url: "#",
      },
      {
        company: "네이버",
        type: "사업보고서",
        date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        url: "#",
      },
    ],
    watchlist: [
      {
        name: "LG에너지솔루션",
        change: 2.3,
        isPositive: true,
      },
      {
        name: "SK하이닉스",
        change: -1.5,
        isPositive: false,
      },
    ],
  });
}

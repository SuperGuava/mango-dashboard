import { NextResponse } from "next/server";

export async function GET() {
  // Mock data for crypto education
  return NextResponse.json({
    btc: {
      price: 42500000,
      change24h: 2.3,
      currency: "KRW",
    },
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
    lastUpdated: new Date().toISOString(),
  });
}

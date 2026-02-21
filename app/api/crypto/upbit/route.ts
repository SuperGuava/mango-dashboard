import { NextResponse } from "next/server";

// Upbit API 응답 타입
interface UpbitTicker {
  market: string;
  trade_date: string;
  trade_time: string;
  trade_date_kst: string;
  trade_time_kst: string;
  trade_timestamp: number;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  prev_closing_price: number;
  change: string; // "RISE" | "EVEN" | "FALL"
  change_price: number;
  change_rate: number;
  signed_change_price: number;
  signed_change_rate: number;
  change_kst: string;
  acc_trade_price: number;
  acc_trade_price_24h: number;
  acc_trade_volume: number;
  acc_trade_volume_24h: number;
  highest_52_week_price: number;
  highest_52_week_date: string;
  lowest_52_week_price: number;
  lowest_52_week_date: string;
  timestamp: number;
}

// Mock 데이터 (폴백용)
const mockData = {
  btc: {
    price: 42500000,
    change24h: 2.3,
    currency: "KRW",
    volume24h: 1234567890000,
    high24h: 43200000,
    low24h: 41800000,
  },
  altcoins: [
    {
      symbol: "ARKM",
      name: "Arkham",
      price: 1250,
      change24h: 18.5,
      volume24h: 98765432100,
    },
    {
      symbol: "BONK",
      name: "Bonk",
      price: 0.025,
      change24h: -5.2,
      volume24h: 12345678900,
    },
    {
      symbol: "SEI",
      name: "Sei",
      price: 850,
      change24h: 12.3,
      volume24h: 87654321900,
    },
  ],
};

// 업비트 API에서 티커 데이터 가져오기
async function fetchUpbitTickers(markets: string[]): Promise<UpbitTicker[]> {
  const marketsParam = markets.join(",");
  const response = await fetch(
    `https://api.upbit.com/v1/ticker?markets=${marketsParam}`,
    {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 10 }, // 10초 캐싱
    }
  );

  if (!response.ok) {
    throw new Error(`Upbit API error: ${response.status}`);
  }

  return response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "btc";

  try {
    if (type === "btc") {
      // BTC/KRW 데이터 조회
      const tickers = await fetchUpbitTickers(["KRW-BTC"]);
      const btc = tickers[0];

      return NextResponse.json({
        success: true,
        data: {
          market: btc.market,
          price: btc.trade_price,
          change24h: btc.signed_change_rate * 100,
          currency: "KRW",
          volume24h: btc.acc_trade_price_24h,
          high24h: btc.high_price,
          low24h: btc.low_price,
          openingPrice: btc.opening_price,
          prevClosingPrice: btc.prev_closing_price,
          change: btc.change, // "RISE", "EVEN", "FALL"
          highest52w: btc.highest_52_week_price,
          lowest52w: btc.lowest_52_week_price,
        },
        lastUpdated: new Date().toISOString(),
        source: "upbit",
      });
    } else if (type === "altcoins") {
      // 알트코인 데이터 조회
      const altMarkets = ["KRW-ARKM", "KRW-BONK", "KRW-SEI", "KRW-DOGE", "KRW-XRP"];
      const tickers = await fetchUpbitTickers(altMarkets);

      const altcoins = tickers.map((ticker) => {
        const symbol = ticker.market.replace("KRW-", "");
        const nameMap: { [key: string]: string } = {
          ARKM: "Arkham",
          BONK: "Bonk",
          SEI: "Sei",
          DOGE: "Dogecoin",
          XRP: "Ripple",
        };

        return {
          symbol,
          name: nameMap[symbol] || symbol,
          market: ticker.market,
          price: ticker.trade_price,
          change24h: ticker.signed_change_rate * 100,
          volume24h: ticker.acc_trade_price_24h,
          high24h: ticker.high_price,
          low24h: ticker.low_price,
          change: ticker.change,
        };
      });

      return NextResponse.json({
        success: true,
        data: altcoins,
        lastUpdated: new Date().toISOString(),
        source: "upbit",
      });
    } else {
      // 전체 마켓 데이터
      const allTickers = await fetchUpbitTickers([
        "KRW-BTC",
        "KRW-ARKM",
        "KRW-BONK",
        "KRW-SEI",
      ]);

      return NextResponse.json({
        success: true,
        data: allTickers.map((t) => ({
          market: t.market,
          price: t.trade_price,
          change24h: t.signed_change_rate * 100,
          volume24h: t.acc_trade_price_24h,
        })),
        lastUpdated: new Date().toISOString(),
        source: "upbit",
      });
    }
  } catch (error) {
    console.error("Upbit API error:", error);

    // API 실패 시 Mock 데이터로 폴백
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch from Upbit API",
        fallback: true,
        data: type === "btc" ? mockData.btc : mockData.altcoins,
        lastUpdated: new Date().toISOString(),
        source: "mock",
      },
      { status: 200 } // 200으로 반환하여 클라이언트가 폴백 데이터 사용 가능
    );
  }
}

import { NextResponse } from "next/server";

// DART API 타입 정의
interface DartCorpInfo {
  corp_code: string;
  corp_name: string;
  stock_code: string;
  modify_date: string;
}

interface KRXIndexData {
  idxNm: string; // 지수명
  clpr: string; // 종가
  vs: string; // 대비
  fltRt: string; // 등락률
  mkp: string; // 시가
  hipr: string; // 고가
  lopr: string; // 저가
  trqu: string; // 거래량
  trPrc: string; // 거래대금
}

// Mock 데이터 (폴리백용)
const mockIPOData = {
  indices: {
    kospi: {
      value: 2580.12,
      change: 20.15,
      changePercent: 0.8,
      volume: 820000000000,
      source: "mock",
    },
    kosdaq: {
      value: 820.45,
      change: -2.45,
      changePercent: -0.3,
      volume: 310000000000,
      source: "mock",
    },
  },
  majorCompanies: [
    { name: "삼성전자", code: "005930", price: 58200, change: -0.5, source: "mock" },
    { name: "SK하이닉스", code: "000660", price: 182500, change: 2.3, source: "mock" },
    { name: "현대차", code: "005380", price: 245000, change: 1.2, source: "mock" },
    { name: "카카오", code: "035720", price: 42300, change: -1.8, source: "mock" },
    { name: "네이버", code: "035420", price: 212000, change: 0.3, source: "mock" },
    { name: "LG에너지솔루션", code: "373220", price: 432000, change: -0.9, source: "mock" },
  ],
  disclosures: [
    {
      company: "삼성전자",
      type: "분기보고서",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      corpCode: "00126380",
    },
    {
      company: "카카오",
      type: "주주총회",
      date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      corpCode: "00120182",
    },
  ],
};

// DART API에서 기업 목록 가져오기
async function fetchDartCorpList(apiKey: string): Promise<DartCorpInfo[]> {
  const response = await fetch(
    `https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=${apiKey}`,
    {
      next: { revalidate: 86400 }, // 24시간 캐싱
    }
  );

  if (!response.ok) {
    throw new Error(`DART API error: ${response.status}`);
  }

  // XML 파싱은 별도 구현 필요 (간략화를 위해 생략)
  return [];
}

// KRX API에서 지수 데이터 가져오기
async function fetchKRXIndices(apiKey: string): Promise<{
  kospi: KRXIndexData | null;
  kosdaq: KRXIndexData | null;
}> {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  try {
    // KOSPI 데이터
    const kospiResponse = await fetch(
      `https://apis.data.go.kr/1160100/service/GetMarketIndexInfoService/getStockMarketIndex?serviceKey=${apiKey}&resultType=json&idxNm=코스피&basDt=${today}`,
      { next: { revalidate: 300 } }
    );

    // KOSDAQ 데이터
    const kosdaqResponse = await fetch(
      `https://apis.data.go.kr/1160100/service/GetMarketIndexInfoService/getStockMarketIndex?serviceKey=${apiKey}&resultNm=코스닥&basDt=${today}`,
      { next: { revalidate: 300 } }
    );

    const kospiData = kospiResponse.ok ? await kospiResponse.json() : null;
    const kosdaqData = kosdaqResponse.ok ? await kosdaqResponse.json() : null;

    return {
      kospi: kospiData?.response?.body?.items?.item?.[0] || null,
      kosdaq: kosdaqData?.response?.body?.items?.item?.[0] || null,
    };
  } catch (error) {
    console.error("KRX API error:", error);
    return { kospi: null, kosdaq: null };
  }
}

export async function GET(request: Request) {
  const dartApiKey = process.env.DART_API_KEY;
  const krxApiKey = process.env.KRX_API_KEY;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "indices";

  // API 키가 없으면 Mock 데이터 반환
  if (!dartApiKey && !krxApiKey) {
    console.log("DART/KRX API keys not found, returning mock data");

    return NextResponse.json({
      success: true,
      mock: true,
      message: "API keys not configured. Using mock data.",
      data: type === "indices" ? mockIPOData.indices : mockIPOData,
      lastUpdated: new Date().toISOString(),
    });
  }

  try {
    if (type === "indices") {
      // KOSPI/KOSDAQ 지수 데이터
      let kospiData = mockIPOData.indices.kospi;
      let kosdaqData = mockIPOData.indices.kosdaq;

      // KRX API 키가 있으면 실제 데이터 시도
      if (krxApiKey) {
        const indices = await fetchKRXIndices(krxApiKey);

        if (indices.kospi) {
          kospiData = {
            value: parseFloat(indices.kospi.clpr),
            change: parseFloat(indices.kospi.vs),
            changePercent: parseFloat(indices.kospi.fltRt),
            volume: parseFloat(indices.kospi.trPrc) || 820000000000,
            source: "krx",
          };
        }

        if (indices.kosdaq) {
          kosdaqData = {
            value: parseFloat(indices.kosdaq.clpr),
            change: parseFloat(indices.kosdaq.vs),
            changePercent: parseFloat(indices.kosdaq.fltRt),
            volume: parseFloat(indices.kosdaq.trPrc) || 310000000000,
            source: "krx",
          };
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          kospi: kospiData,
          kosdaq: kosdaqData,
        },
        mock: !krxApiKey,
        lastUpdated: new Date().toISOString(),
      });
    } else if (type === "companies") {
      // 주요 기업 주가 정보 (KRX API로 조회 가능)
      return NextResponse.json({
        success: true,
        mock: true,
        message: "Company stock prices require additional KRX API implementation",
        data: mockIPOData.majorCompanies,
        lastUpdated: new Date().toISOString(),
      });
    } else if (type === "disclosures") {
      // 공시 정보 (DART API)
      return NextResponse.json({
        success: true,
        mock: true,
        message: "DART disclosures require API key and implementation",
        data: mockIPOData.disclosures,
        lastUpdated: new Date().toISOString(),
      });
    }

    // 전체 데이터
    return NextResponse.json({
      success: true,
      mock: !krxApiKey,
      data: {
        indices: mockIPOData.indices,
        majorCompanies: mockIPOData.majorCompanies,
        disclosures: mockIPOData.disclosures,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("DART/KRX API error:", error);

    // API 실패 시 Mock 데이터로 폴백
    return NextResponse.json({
      success: false,
      error: "Failed to fetch from DART/KRX API",
      fallback: true,
      mock: true,
      data: type === "indices" ? mockIPOData.indices : mockIPOData,
      lastUpdated: new Date().toISOString(),
    });
  }
}

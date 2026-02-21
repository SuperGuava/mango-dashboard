"use client";

import useSWR from "swr";
import { TrendingUp, TrendingDown, Calendar, Building2, Sparkles, Bell } from "lucide-react";
import Widget from "../Widget";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DartIndexData {
  value: number;
  change: number;
  changePercent: number;
}

interface IPOItem {
  name: string;
  type: "공모" | "상장";
  date: string;
  price?: string;
}

interface DartSnapshotData {
  success: boolean;
  data: {
    kospi: DartIndexData;
    kosdaq: DartIndexData;
    ipoNews?: IPOItem[];
    preliminaryCompanies?: Array<{
      name: string;
      sector: string;
      stage: string;
    }>;
    majorCompanies?: Array<{
      name: string;
      price: number;
      change: number;
      changePercent: number;
    }>;
  };
  lastUpdated: string;
  source?: string;
}

// 상장 소식 더미 데이터 (KRX API 연동 준비)
const defaultIPONews: IPOItem[] = [
  { name: "오상자이엘", type: "공모", date: "2/24~25", price: "18,000원" },
  { name: "케이티앤지", type: "상장", date: "2/28" },
  { name: "엔비티", type: "공모", date: "3/3~4", price: "12,000원" },
];

// 예비심사 기업 (더미 데이터)
const defaultPreliminaryCompanies = [
  { name: "스마트솔루션즈", sector: "소프트웨어", stage: "예비심사" },
  { name: "그린에너지", sector: "신재생에너지", stage: "심사중" },
];

// 주요 기업 더미 데이터 (시총 TOP 3)
const defaultMajorCompanies = [
  { name: "삼성전자", price: 78500, change: 1200, changePercent: 1.55 },
  { name: "SK하이닉스", price: 198500, change: 4500, changePercent: 2.32 },
  { name: "현대차", price: 242000, change: -3500, changePercent: -1.43 },
];

function IndexDisplay({ 
  title, 
  data 
}: { 
  title: string; 
  data: DartIndexData | undefined;
}) {
  if (!data) {
    return (
      <div className="flex flex-col items-center p-4 bg-[var(--bg-elevated)] rounded-xl">
        <div className="text-xs text-[var(--text-secondary)] mb-1">{title}</div>
        <div className="text-2xl font-bold text-[var(--text-primary)]">--</div>
      </div>
    );
  }

  const isPositive = data.change >= 0;

  return (
    <div className="flex flex-col items-center p-4 bg-[var(--bg-elevated)] rounded-xl">
      <div className="text-xs text-[var(--text-secondary)] mb-2">{title}</div>
      
      {/* 큰 숫자 */}
      <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
        {data.value.toLocaleString('ko-KR')}
      </div>
      
      {/* 변동률 */}
      <div className={`flex items-center gap-1 text-sm font-semibold ${
        isPositive ? "text-[var(--success)]" : "text-[var(--error)]"
      }`}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span>{isPositive ? "+" : ""}{data.changePercent.toFixed(2)}%</span>
      </div>
    </div>
  );
}

function formatPrice(price: number): string {
  if (price >= 100000) {
    return `₩${(price / 10000).toFixed(1)}만`;
  }
  return `₩${price.toLocaleString('ko-KR')}`;
}

export default function IPOSnapshot() {
  const { data: dartData, error: dartError } = useSWR<DartSnapshotData>(
    "/api/ipo/dart",
    fetcher,
    { refreshInterval: 60000 }
  );

  const isLoading = !dartData;
  const kospi = dartData?.data?.kospi;
  const kosdaq = dartData?.data?.kosdaq;
  
  // API 데이터 또는 기본값 사용
  const ipoNews = dartData?.data?.ipoNews || defaultIPONews;
  const preliminaryCompanies = dartData?.data?.preliminaryCompanies || defaultPreliminaryCompanies;
  const majorCompanies = dartData?.data?.majorCompanies || defaultMajorCompanies;
  const dataSource = dartData?.source || "mock";

  return (
    <Widget 
      title="IPO Snapshot" 
      icon="🏢"
      mangoPick="이번 공모주 중 오상자이엘 관심 있어요"
      loading={isLoading}
    >
      <div className="space-y-4">
        {/* KOSPI / KOSDAQ - 큰 숫자 2개 */}
        <div className="grid grid-cols-2 gap-3">
          <IndexDisplay title="KOSPI" data={kospi} />
          <IndexDisplay title="KOSDAQ" data={kosdaq} />
        </div>

        {/* 📰 공모주 일정 */}
        <div className="p-4 bg-[var(--bg-elevated)] rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--accent-mango)]" />
              <span className="text-sm font-bold text-[var(--text-primary)]">공모주 일정</span>
            </div>
            {dataSource === "mock" && (
              <span className="text-xs px-2 py-0.5 bg-[var(--warning)]/20 text-[var(--warning)] rounded-full">Mock</span>
            )}
          </div>
          <div className="space-y-2">
            {ipoNews.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm p-2 bg-[var(--bg-primary)] rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    item.type === "공모" 
                      ? "bg-[var(--accent-mango)]/20 text-[var(--accent-mango)]" 
                      : "bg-[var(--success)]/20 text-[var(--success)]"
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-[var(--text-primary)] font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-[var(--text-secondary)] text-xs">{item.date}</div>
                  {item.price && (
                    <div className="text-[var(--accent-mango)] text-xs font-medium">{item.price}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 📋 예비심사 기업 */}
        <div className="p-4 bg-[var(--bg-elevated)] rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-[var(--accent-mango)]" />
            <span className="text-sm font-bold text-[var(--text-primary)]">예비심사 기업</span>
          </div>
          <div className="space-y-2">
            {preliminaryCompanies.map((company, index) => (
              <div key={index} className="flex items-center justify-between text-sm p-2 bg-[var(--bg-primary)] rounded-lg">
                <div>
                  <div className="text-[var(--text-primary)] font-medium">{company.name}</div>
                  <div className="text-[var(--text-secondary)] text-xs">{company.sector}</div>
                </div>
                <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--info)]/20 text-[var(--info)]">
                  {company.stage}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-[var(--text-secondary)] text-center">
            💡 KRX API 연동 준비 완료 (KRX_API_KEY 환경변수 필요)
          </div>
        </div>

        {/* 🏢 주요 기업 */}
        <div className="p-4 bg-[var(--bg-elevated)] rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-[var(--accent-mango)]" />
            <span className="text-sm font-bold text-[var(--text-primary)]">주요 기업</span>
          </div>
          <div className="space-y-2">
            {majorCompanies.slice(0, 3).map((company, index) => {
              const isPositive = company.change >= 0;
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-primary)] font-medium">{company.name}</span>
                  <div className="text-right">
                    <div className="text-sm text-[var(--text-primary)]">{formatPrice(company.price)}</div>
                    <div className={`text-xs ${isPositive ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                      {isPositive ? "▲" : "▼"}{Math.abs(company.changePercent).toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🥭 망고's Pick */}
        <div className="p-4 bg-[var(--accent-mango)]/10 border border-[var(--accent-mango)]/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-mango)]" />
            <span className="text-sm font-bold text-[var(--accent-mango)]">망고's Pick</span>
          </div>
          <p className="text-sm text-[var(--text-primary)]">
            "이번 공모주 중 <span className="font-bold text-[var(--accent-mango)]">오상자이엘</span> 관심 있어요. 반도체 장비 업체로 실적 성장세가 좋습니다."
          </p>
          <div className="mt-2 text-xs text-[var(--text-secondary)]">
            💡 팁: 공모주는 소액으로 분산 청약하세요
          </div>
        </div>

        {/* 에러 메시지 */}
        {dartError && (
          <div className="text-sm text-[var(--error)] text-center">
            데이터를 불러올 수 없습니다
          </div>
        )}
      </div>
    </Widget>
  );
}

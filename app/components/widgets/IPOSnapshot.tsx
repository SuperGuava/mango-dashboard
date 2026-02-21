"use client";

import useSWR from "swr";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import Widget from "../Widget";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DartIndexData {
  value: number;
  change: number;
  changePercent: number;
}

interface DartSnapshotData {
  success: boolean;
  data: {
    kospi: DartIndexData;
    kosdaq: DartIndexData;
  };
  lastUpdated: string;
}

function IndexDisplay({ 
  title, 
  data, 
  delay = 0 
}: { 
  title: string; 
  data: DartIndexData | undefined;
  delay?: number;
}) {
  if (!data) {
    return (
      <div className="flex flex-col items-center p-5 bg-[var(--bg-elevated)] rounded-xl">
        <div className="text-sm text-[var(--text-secondary)] mb-2">{title}</div>
        <div className="text-3xl font-bold text-[var(--text-primary)]">--</div>
      </div>
    );
  }

  const isPositive = data.change >= 0;

  return (
    <div className="flex flex-col items-center p-5 bg-[var(--bg-elevated)] rounded-xl">
      <div className="text-sm text-[var(--text-secondary)] mb-3">{title}</div>
      
      {/* 큰 숫자 */}
      <div className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
        {data.value.toLocaleString('ko-KR')}
      </div>
      
      {/* 변동률 - 색상으로 표현 */}
      <div className={`flex items-center gap-1.5 text-lg font-semibold ${
        isPositive ? "text-[var(--success)]" : "text-[var(--error)]"
      }`}>
        {isPositive ? (
          <TrendingUp className="w-5 h-5" />
        ) : (
          <TrendingDown className="w-5 h-5" />
        )}
        <span>{isPositive ? "+" : ""}{data.changePercent.toFixed(2)}%</span>
      </div>
    </div>
  );
}

export default function IPOSnapshot() {
  const [showDetail, setShowDetail] = useState(false);
  
  const { data: dartData, error: dartError } = useSWR<DartSnapshotData>(
    "/api/ipo/dart?type=indices",
    fetcher,
    { refreshInterval: 60000 }
  );

  const isLoading = !dartData;
  const kospi = dartData?.data?.kospi;
  const kosdaq = dartData?.data?.kosdaq;

  return (
    <Widget 
      title="IPO Snapshot" 
      icon="🏢"
      mangoPick="KOSPI 반등 시점 노려보세요"
      loading={isLoading}
    >
      <div className="space-y-5">
        {/* KOSPI / KOSDAQ - 큰 숫자 2개 */}
        <div className="grid grid-cols-2 gap-4">
          <IndexDisplay title="KOSPI" data={kospi} />
          <IndexDisplay title="KOSDAQ" data={kosdaq} />
        </div>

        {/* 상세 보기 버튼 */}
        <button
          onClick={() => setShowDetail(!showDetail)}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg transition-colors text-sm font-medium"
        >
          {showDetail ? "접기" : "상세 보기"}
          <ChevronRight className={`w-4 h-4 transition-transform ${showDetail ? "rotate-90" : ""}`} />
        </button>

        {/* 확장된 상세 정보 */}
        {showDetail && (
          <div className="p-4 bg-[var(--bg-elevated)] rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">상세 정보</div>
            {kospi && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">KOSPI 변동</span>
                <span className={kospi.change >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"}>
                  {kospi.change >= 0 ? "+" : ""}{kospi.change.toLocaleString('ko-KR')}
                </span>
              </div>
            )}
            {kosdaq && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">KOSDAQ 변동</span>
                <span className={kosdaq.change >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"}>
                  {kosdaq.change >= 0 ? "+" : ""}{kosdaq.change.toLocaleString('ko-KR')}
                </span>
              </div>
            )}
            <div className="text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)]">
              데이터 출처: KRX
            </div>
          </div>
        )}

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

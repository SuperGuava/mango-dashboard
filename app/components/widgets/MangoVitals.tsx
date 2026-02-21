"use client";

import useSWR from "swr";
import { RefreshCw, Activity } from "lucide-react";
import Widget from "../Widget";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface OpenClawHealthData {
  success: boolean;
  data: {
    gateway: {
      status: "online" | "offline" | "unknown";
      lastChecked: string | null;
    };
  };
  lastUpdated: string;
}

export default function MangoVitals() {
  const { data: openclawData, error: openclawError, mutate } = useSWR<OpenClawHealthData>(
    "/api/health/openclaw?type=summary",
    fetcher,
    { refreshInterval: 30000 }
  );

  const isLoading = !openclawData;
  const gateway = openclawData?.data?.gateway;
  const isOnline = gateway?.status === "online";

  const handleRefresh = async () => {
    await mutate();
  };

  // 마지막 체크 시간 포맷팅
  const getLastChecked = () => {
    if (!gateway?.lastChecked) return "--";
    const date = new Date(gateway.lastChecked);
    return date.toLocaleTimeString("ko-KR", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: false 
    });
  };

  return (
    <Widget 
      title="Mango Vitals" 
      icon="🥭"
      loading={isLoading}
      mangoPick="모든 시스템 정상 작동 중!"
    >
      <div className="flex flex-col items-center justify-center py-4">
        {/* 대형 상태 아이콘 */}
        <div className="relative mb-4">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
            isOnline 
              ? "bg-[var(--success)]/20 border-4 border-[var(--success)]" 
              : "bg-[var(--error)]/20 border-4 border-[var(--error)]"
          }`}>
            <Activity className={`w-12 h-12 ${
              isOnline ? "text-[var(--success)]" : "text-[var(--error)]"
            }`} />
          </div>
          {/* 펄스 애니메이션 */}
          {isOnline && (
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-[var(--success)]/30 animate-ping" />
          )}
        </div>

        {/* 상태 텍스트 */}
        <div className="text-center mb-6">
          <div className={`text-3xl font-bold mb-1 ${
            isOnline ? "text-[var(--success)]" : "text-[var(--error)]"
          }`}>
            {isOnline ? "🟢 Online" : "🔴 Offline"}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            마지막 체크: {getLastChecked()}
          </div>
        </div>

        {/* 새로고침 버튼 */}
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          새로고침
        </button>

        {/* 에러 메시지 */}
        {openclawError && (
          <div className="mt-4 text-sm text-[var(--error)]">
            데이터를 불러올 수 없습니다
          </div>
        )}
      </div>
    </Widget>
  );
}

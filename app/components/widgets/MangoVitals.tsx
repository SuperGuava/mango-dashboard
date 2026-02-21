"use client";

import useSWR from "swr";
import { RefreshCw, Activity, Cpu, Clock, FileText, Zap } from "lucide-react";
import Widget from "../Widget";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface OpenClawHealthData {
  success: boolean;
  data: {
    gateway: {
      status: "online" | "offline" | "unknown";
      lastChecked: string | null;
    };
    gpt?: {
      used: number;
      limit: number;
      percentage: number;
    };
    cron?: {
      enabled: boolean;
      lastRun: string | null;
      nextRun: string | null;
    };
    logs?: {
      size: string;
      files: number;
      lastUpdate: string;
    };
  };
  lastUpdated: string;
}

export default function MangoVitals() {
  const { data: openclawData, error: openclawError, mutate } = useSWR<OpenClawHealthData>(
    "/api/health/openclaw",
    fetcher,
    { refreshInterval: 30000 }
  );

  const isLoading = !openclawData;
  const gateway = openclawData?.data?.gateway;
  const gpt = openclawData?.data?.gpt;
  const cron = openclawData?.data?.cron;
  const logs = openclawData?.data?.logs;
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

  // GPT 사용량 퍼센트
  const gptPercentage = gpt?.percentage || 0;
  const getGptColor = () => {
    if (gptPercentage < 50) return "text-[var(--success)]";
    if (gptPercentage < 80) return "text-[var(--warning)]";
    return "text-[var(--error)]";
  };

  return (
    <Widget 
      title="Mango Vitals" 
      icon="🥭"
      loading={isLoading}
      mangoPick="모든 시스템 정상 작동 중!"
    >
      <div className="space-y-4">
        {/* 게이트웨이 상태 */}
        <div className="p-4 bg-[var(--bg-elevated)] rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent-mango)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">게이트웨이 상태</span>
            </div>
            <span className={`text-sm font-bold ${isOnline ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
              {isOnline ? "🟢 Online" : "🔴 Offline"}
            </span>
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            마지막 체크: {getLastChecked()}
          </div>
        </div>

        {/* GPT 사용량 */}
        <div className="p-4 bg-[var(--bg-elevated)] rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--accent-mango)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">GPT 사용량</span>
            </div>
            <span className={`text-sm font-bold ${getGptColor()}`}>
              {gpt?.used || 0} / {gpt?.limit || 100}
            </span>
          </div>
          <div className="w-full bg-[var(--bg-primary)] rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                gptPercentage < 50 ? "bg-[var(--success)]" : 
                gptPercentage < 80 ? "bg-[var(--warning)]" : "bg-[var(--error)]"
              }`}
              style={{ width: `${Math.min(gptPercentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-2">
            {gptPercentage.toFixed(1)}% 사용 중
          </div>
        </div>

        {/* Cron 작업 상태 */}
        <div className="p-4 bg-[var(--bg-elevated)] rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent-mango)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Cron 작업</span>
            </div>
            <span className={`text-sm font-bold ${cron?.enabled ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
              {cron?.enabled ? "✅ 활성화" : "❌ 비활성화"}
            </span>
          </div>
          <div className="text-xs text-[var(--text-secondary)] space-y-1">
            {cron?.lastRun && (
              <div>마지막 실행: {new Date(cron.lastRun).toLocaleString("ko-KR")}</div>
            )}
            {cron?.nextRun && (
              <div>다음 실행: {new Date(cron.nextRun).toLocaleString("ko-KR")}</div>
            )}
          </div>
        </div>

        {/* 로그 파일 정보 */}
        <div className="p-4 bg-[var(--bg-elevated)] rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--accent-mango)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">로그 파일</span>
            </div>
            <span className="text-sm font-bold text-[var(--text-primary)]">
              {logs?.size || "--"}
            </span>
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            파일 수: {logs?.files || 0}개
            {logs?.lastUpdate && (
              <span className="ml-2">• 마지막 업데이트: {new Date(logs.lastUpdate).toLocaleString("ko-KR")}</span>
            )}
          </div>
        </div>

        {/* 새로고침 버튼 */}
        <button
          onClick={handleRefresh}
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          새로고침
        </button>

        {/* 에러 메시지 */}
        {openclawError && (
          <div className="text-sm text-[var(--error)] text-center">
            데이터를 불러올 수 없습니다
          </div>
        )}
      </div>
    </Widget>
  );
}

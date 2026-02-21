"use client";

import useSWR from "swr";
import { Activity, Clock, Zap, Calendar, AlertCircle, FileText } from "lucide-react";
import Widget from "../Widget";
import { formatTimeRemaining } from "../../lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface OpenClawHealthData {
  success: boolean;
  data: {
    gateway: {
      status: "online" | "offline" | "unknown";
      lastChecked: string | null;
      uptime: string | null;
      errors: string[];
    };
    cronJobs: Array<{
      name: string;
      lastRun: string | null;
      status: "success" | "error" | "running" | "unknown";
      logCount: number;
      recentErrors: number;
    }>;
    gptUsage: {
      estimatedTokens: number;
      estimatedCost: number;
      last24hCalls: number;
      lastReset: string | null;
    };
    logFiles: Array<{
      name: string;
      size: number;
      modified: string;
    }>;
    logDirectory: string;
  };
  fallback?: boolean;
  lastUpdated: string;
}

export default function MangoVitals() {
  // OpenClaw 로그 파싱 API 사용
  const { data: openclawData, error: openclawError } = useSWR<OpenClawHealthData>(
    "/api/health/openclaw?type=summary",
    fetcher,
    { refreshInterval: 30000 }
  );

  const isLoading = !openclawData;
  const isFallback = openclawData?.fallback;

  const healthData = openclawData?.data;
  const gateway = healthData?.gateway;
  const cronJobs = healthData?.cronJobs || [];
  const gptUsage = healthData?.gptUsage;

  // 최근 24시간 크론 작업 상태 계산
  const totalJobs = cronJobs.length;
  const successfulJobs = cronJobs.filter(j => j.status === "success").length;
  const failedJobs = cronJobs.filter(j => j.status === "error" || j.recentErrors > 0).length;

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "online":
      case "success":
      case "ok":
        return "bg-[var(--success)]";
      case "running":
      case "limited":
      case "warning":
        return "bg-[var(--warning)]";
      case "offline":
      case "error":
      case "exhausted":
        return "bg-[var(--error)]";
      case "unknown":
      default:
        return "bg-[var(--text-secondary)]";
    }
  };

  return (
    <Widget 
      title="Mango Vitals" 
      icon="🥭"
      loading={isLoading}
    >
      <div className="space-y-3">
        {/* Gateway Status */}
        <div className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] rounded-lg">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(gateway?.status)}`}></div>
            {gateway?.status === "online" && (
              <div className={`absolute inset-0 w-3 h-3 rounded-full ${getStatusColor(gateway?.status)} animate-pulse-ring`}></div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-[var(--text-primary)]">OpenClaw Gateway</div>
            <div className="text-xs text-[var(--text-secondary)]">
              {gateway?.status === "online" ? "Online" : gateway?.status === "offline" ? "Offline" : "Unknown"}
            </div>
          </div>
          <Activity className="w-4 h-4 text-[var(--text-secondary)]" />
        </div>

        {/* GPT Usage */}
        <div className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] rounded-lg">
          <div className={`w-3 h-3 rounded-full ${gptUsage && gptUsage.estimatedTokens > 100000 ? "bg-[var(--warning)]" : "bg-[var(--success)]"}`}></div>
          <div className="flex-1">
            <div className="text-sm font-medium text-[var(--text-primary)]">GPT Usage (24h)</div>
            <div className="text-xs text-[var(--text-secondary)]">
              {gptUsage ? `${gptUsage.last24hCalls} calls • ~${gptUsage.estimatedTokens.toLocaleString()} tokens` : "--"}
            </div>
          </div>
          <Zap className="w-4 h-4 text-[var(--text-secondary)]" />
        </div>

        {/* Cron Jobs */}
        <div className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] rounded-lg">
          <div className={`w-3 h-3 rounded-full ${failedJobs === 0 ? "bg-[var(--success)]" : failedJobs < 3 ? "bg-[var(--warning)]" : "bg-[var(--error)]"}`}></div>
          <div className="flex-1">
            <div className="text-sm font-medium text-[var(--text-primary)]">Cron Jobs</div>
            <div className="text-xs text-[var(--text-secondary)]">
              {totalJobs > 0 ? `${successfulJobs}/${totalJobs} Success${failedJobs > 0 ? ` • ${failedJobs} Failed` : ""}` : "No jobs found"}
            </div>
          </div>
          <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
        </div>

        {/* Recent Log Files */}
        {healthData?.logFiles && healthData.logFiles.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] rounded-lg">
            <div className="w-3 h-3 rounded-full bg-[var(--info)]"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--text-primary)]">Log Files</div>
              <div className="text-xs text-[var(--text-secondary)]">
                {healthData.logFiles.length} files tracked
              </div>
            </div>
            <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
          </div>
        )}

        {/* Fallback Warning */}
        {isFallback && (
          <div className="flex items-center gap-2 p-2 bg-[var(--warning)]/10 rounded-lg text-xs text-[var(--warning)]">
            <AlertCircle className="w-4 h-4" />
            <span>로그 디렉토리를 찾을 수 없습니다</span>
          </div>
        )}

        {/* Error Message */}
        {openclawError && (
          <div className="flex items-center gap-2 p-2 bg-[var(--error)]/10 rounded-lg text-xs text-[var(--error)]">
            <AlertCircle className="w-4 h-4" />
            <span>로그 데이터를 불러올 수 없습니다</span>
          </div>
        )}
      </div>
    </Widget>
  );
}

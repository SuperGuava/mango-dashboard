"use client";

import useSWR from "swr";
import { RefreshCw, Sparkles } from "lucide-react";
import Widget from "../Widget";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface FamilyCompanionData {
  lastUpdated: string;
  do1Content: {
    title: string;
    emoji: string;
  };
  do0Content: {
    title: string;
    emoji: string;
  };
  todaysQuestion: {
    text: string;
    target: "do1" | "do0";
  };
}

export default function FamilyCompanion() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data, error, mutate } = useSWR<FamilyCompanionData>(
    "/api/family-companion/status",
    fetcher,
    { refreshInterval: 1000 * 60 * 60 }
  );

  const isLoading = !data && !error;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await mutate();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const formatLastUpdated = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("ko-KR", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: false 
    });
  };

  // 오늘의 주제 선택 (도1/도0 중 하나)
  const todayTopic = data?.todaysQuestion || { text: "오늘의 질문을 준비 중입니다...", target: "do1" as const };
  const isDo1 = todayTopic.target === "do1";

  return (
    <Widget 
      title="Family Companion" 
      icon="👨‍👩‍👧"
      mangoPick={isDo1 ? "도1에게 이 질문 먼저 합시다" : "도0에게 이 질문 먼저 합시다"}
      loading={isLoading}
    >
      <div className="flex flex-col py-2">
        {/* 오늘의 주제 - 크게 표시 */}
        <div className="text-center mb-6">
          {/* 태그 */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isDo1 
                ? "bg-blue-500/20 text-blue-400" 
                : "bg-amber-500/20 text-amber-400"
            }`}>
              {isDo1 ? "👦 도1" : "👧 도0"}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">오늘의 주제</span>
          </div>
          
          {/* 큰 질문 텍스트 */}
          <div className="relative">
            <Sparkles className="absolute -top-2 -left-2 w-6 h-6 text-[var(--accent-mango)] opacity-50" />
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-relaxed px-4">
              {todayTopic.text}
            </h3>
            <Sparkles className="absolute -bottom-2 -right-2 w-6 h-6 text-[var(--accent-mango)] opacity-50" />
          </div>
        </div>

        {/* 새로고침 버튼 */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            새로고침
          </button>
          
          {data?.lastUpdated && (
            <span className="text-xs text-[var(--text-secondary)]">
              업데이트: {formatLastUpdated(data.lastUpdated)}
            </span>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-4 text-sm text-[var(--error)] text-center">
            데이터를 불러올 수 없습니다
          </div>
        )}
      </div>
    </Widget>
  );
}

"use client";

import useSWR from "swr";
import { Linkedin, ExternalLink, Edit3, Clock } from "lucide-react";
import Widget from "../Widget";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface LinkedInSnapshotData {
  linkedin: {
    current: number;
    total: number;
    lastPostTitle?: string;
    nextTitle: string;
    nextScheduledAt: string;
  };
}

export default function LinkedInSnapshot() {
  const { data, error } = useSWR<LinkedInSnapshotData>(
    "/api/content-snapshot",
    fetcher,
    { refreshInterval: 60000 }
  );

  const isLoading = !data;
  const linkedin = data?.linkedin;
  
  const current = linkedin?.current || 0;
  const total = linkedin?.total || 100;

  // 다음 예정 시간 포맷팅
  const getNextSchedule = () => {
    if (!linkedin?.nextScheduledAt) return "내일 06:30";
    const date = new Date(linkedin.nextScheduledAt);
    return date.toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  };

  return (
    <Widget 
      title="LinkedIn Snapshot" 
      icon="💼"
      mangoPick="AI 트렌드 주제로 2편 연달아 써보세요"
      loading={isLoading}
    >
      <div className="flex flex-col py-2">
        {/* 100선 진행률 - 큰 숫자 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-[#0A66C2]/20 flex items-center justify-center flex-shrink-0">
            <Linkedin className="w-8 h-8 text-[#0A66C2]" />
          </div>
          <div className="text-center">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl sm:text-6xl font-bold text-[var(--text-primary)]">{current}</span>
              <span className="text-2xl text-[var(--text-secondary)]">/ {total}</span>
            </div>
            <div className="text-sm text-[var(--accent-mango)] font-medium mt-1">
              100선 진행률
            </div>
          </div>
        </div>

        {/* 최근 게시글 + 다음 글감 */}
        <div className="space-y-3 mb-6">
          {/* 최근 게시글 */}
          {linkedin?.lastPostTitle && (
            <div className="p-4 bg-[var(--bg-elevated)] rounded-xl">
              <div className="text-xs text-[var(--text-secondary)] mb-1">최근 게시글</div>
              <div className="text-base font-medium text-[var(--text-primary)] truncate">
                {linkedin.lastPostTitle}
              </div>
            </div>
          )}
          
          {/* 다음 글감 */}
          <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border-l-4 border-[var(--accent-mango)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
              <Clock className="w-3 h-3" />
              <span>다음 글감: {getNextSchedule()}</span>
            </div>
            <div className="text-base font-medium text-[var(--text-primary)] truncate">
              {linkedin?.nextTitle || "예정된 주제"}
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex gap-3">
          <a
            href="https://www.linkedin.com/in/juntheworld/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            바로가기
          </a>
          <a
            href="https://www.linkedin.com/in/juntheworld/post/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Edit3 className="w-4 h-4" />
            새 글 작성
          </a>
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

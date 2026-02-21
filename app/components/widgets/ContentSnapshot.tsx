"use client";

import useSWR from "swr";
import { Linkedin, CheckCircle, Clock, Edit3 } from "lucide-react";
import Widget from "../Widget";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ContentSnapshotData {
  linkedin: {
    current: number;
    total: number;
    nextScheduledAt: string;
  };
}

export default function ContentSnapshot() {
  const { data, error } = useSWR<ContentSnapshotData>(
    "/api/content-snapshot",
    fetcher,
    { refreshInterval: 60000 }
  );

  const isLoading = !data;
  const linkedin = data?.linkedin;
  
  const current = linkedin?.current || 0;
  const total = linkedin?.total || 100;
  const progress = (current / total) * 100;

  // 다음 예정 시간 포맷팅
  const getNextSchedule = () => {
    if (!linkedin?.nextScheduledAt) return "내일 06:30";
    const date = new Date(linkedin.nextScheduledAt);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(6, 30, 0, 0);
    
    return date.toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-6 widget-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📈</span>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Content Snapshot
          </h2>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-32 bg-[var(--border-subtle)] rounded-xl" />
      ) : (
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* LinkedIn 아이콘 + 진행률 */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#0A66C2]/20 flex items-center justify-center flex-shrink-0">
              <Linkedin className="w-8 h-8 text-[#0A66C2]" />
            </div>
            <div>
              <div className="text-sm text-[var(--text-secondary)] mb-1">LinkedIn 100선</div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[var(--text-primary)]">{current}</span>
                <span className="text-lg text-[var(--text-secondary)]">/ {total}</span>
              </div>
            </div>
          </div>

          {/* 진행률 바 */}
          <div className="flex-1">
            <div className="h-4 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#0A66C2] to-[#0077B5] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-[var(--text-secondary)]">{Math.round(progress)}% 완료</span>
              <span className="text-[var(--accent-mango)]">{total - current}개 남음</span>
            </div>
          </div>

          {/* 다음 예정 + 새 글 버튼 */}
          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Clock className="w-4 h-4" />
              <span>다음 예정: {getNextSchedule()} 2탄</span>
            </div>
            <a
              href="https://www.linkedin.com/in/juntheworld/post/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Edit3 className="w-4 h-4" />
              새 글 작성
            </a>
          </div>
        </div>
      )}

      {/* 🥭 Mango's Pick */}
      <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg">🥭</span>
          <span className="text-[var(--accent-mango)] font-medium">Mango&apos;s Pick:</span>
          <span className="text-[var(--text-secondary)]">꾸준한 포스팅이 네트워킹의 핵심입니다</span>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-4 text-sm text-[var(--error)]">
          데이터를 불러올 수 없습니다
        </div>
      )}
    </div>
  );
}

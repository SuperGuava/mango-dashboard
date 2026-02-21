"use client";

import useSWR from "swr";
import { BookOpen, ArrowRight } from "lucide-react";
import Widget from "../Widget";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface KnowledgeQueueData {
  retention: {
    review: number;
    keep: number;
    discard: number;
  };
}

export default function KnowledgeQueue() {
  const { data, error } = useSWR<KnowledgeQueueData>(
    "/api/knowledge-queue",
    fetcher,
    { refreshInterval: 60000 }
  );

  const isLoading = !data;
  const reviewCount = data?.retention?.review || 0;
  const totalCount = (data?.retention?.review || 0) + (data?.retention?.keep || 0) + (data?.retention?.discard || 0);
  
  // 진행률 계산
  const progress = totalCount > 0 ? ((totalCount - reviewCount) / totalCount) * 100 : 0;

  return (
    <Widget 
      title="Knowledge Queue" 
      icon="📚"
      mangoPick="리뷰 대기 중인 지식을 정리하세요"
      loading={isLoading}
    >
      <div className="flex flex-col items-center py-2">
        {/* 리뷰 대기 - 큰 숫자 */}
        <div className="text-center mb-6">
          <div className="text-sm text-[var(--text-secondary)] mb-3">리뷰 대기</div>
          <div className="text-6xl sm:text-7xl font-bold text-[var(--text-primary)]">
            {reviewCount}
          </div>
          <div className="text-sm text-[var(--text-secondary)] mt-2">개의 항목</div>
        </div>

        {/* 진행률 바 */}
        <div className="w-full max-w-[280px] mb-6">
          <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-2">
            <span>진행률</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[var(--accent-mango)] to-[var(--warning)] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-2 text-center">
            {totalCount}개 중 {totalCount - reviewCount}개 완료
          </div>
        </div>

        {/* 지식 관리하기 버튼 */}
        <a
          href="https://obsidian.md"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg transition-colors text-sm font-medium"
        >
          <BookOpen className="w-4 h-4" />
          지식 관리하기
          <ArrowRight className="w-4 h-4" />
        </a>

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

"use client";

import { Linkedin, ExternalLink, Edit3, Clock, TrendingUp, Sparkles } from "lucide-react";
import Widget from "../Widget";

export default function LinkedInPulse() {
  // 고정 데이터 (향후 API 연동 가능)
  const progress = {
    current: 1,
    total: 100,
  };

  const lastPost = {
    title: "망고 토큰 아껴쓰랬지",
    date: "2026-02-20",
  };

  const nextPost = {
    title: "AI 트렌드 분석: 2026년 전망",
    scheduledAt: "내일 06:30",
  };

  const mangoPick = {
    topic: "AI 에이전트 실무 활용",
    reason: "요즘 뜨는 주제예요!",
  };

  const progressPercentage = (progress.current / progress.total) * 100;

  return (
    <Widget 
      title="LinkedIn Pulse" 
      icon="💼"
      mangoPick="꾸준함이 승리합니다!"
    >
      <div className="flex flex-col py-2">
        {/* 100선 진행률 - 큰 숫자 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-[#0A66C2]/20 flex items-center justify-center flex-shrink-0">
            <Linkedin className="w-8 h-8 text-[#0A66C2]" />
          </div>
          <div className="text-center">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl sm:text-6xl font-bold text-[var(--text-primary)]">{progress.current}</span>
              <span className="text-2xl text-[var(--text-secondary)]">/ {progress.total}</span>
            </div>
            <div className="text-sm text-[var(--accent-mango)] font-medium mt-1">
              100선 진행률
            </div>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mb-6">
          <div className="w-full bg-[var(--bg-elevated)] rounded-full h-3">
            <div 
              className="h-3 rounded-full bg-gradient-to-r from-[#0A66C2] to-[var(--accent-mango)] transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-2 text-center">
            {progressPercentage.toFixed(1)}% 달성
          </div>
        </div>

        {/* 최근 게시글 + 다음 글감 */}
        <div className="space-y-3 mb-6">
          {/* 최근 게시글 */}
          <div className="p-4 bg-[var(--bg-elevated)] rounded-xl">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>최근 게시글</span>
            </div>
            <div className="text-base font-medium text-[var(--text-primary)]">
              "{lastPost.title}"
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">
              {lastPost.date}
            </div>
          </div>
          
          {/* 다음 글감 예고 */}
          <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border-l-4 border-[var(--accent-mango)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
              <Clock className="w-3 h-3" />
              <span>다음 글감 예고</span>
            </div>
            <div className="text-base font-medium text-[var(--text-primary)]">
              {nextPost.title}
            </div>
            <div className="text-sm text-[var(--accent-mango)] font-medium mt-1">
              {nextPost.scheduledAt}
            </div>
          </div>
        </div>

        {/* 망고's Pick 추천 */}
        <div className="p-4 bg-[var(--accent-mango)]/10 border border-[var(--accent-mango)]/30 rounded-xl mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-mango)]" />
            <span className="text-sm font-bold text-[var(--accent-mango)]">망고's Pick</span>
          </div>
          <div className="text-base font-medium text-[var(--text-primary)]">
            {mangoPick.topic}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            {mangoPick.reason}
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
      </div>
    </Widget>
  );
}

"use client";

import useSWR from "swr";
import { Newspaper, BookOpen, MessageSquare, CheckCircle, Clock } from "lucide-react";
import Widget from "../Widget";
import { formatRelativeTime } from "../../lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ContentSnapshotData {
  recentContent: Array<{
    type: string;
    title?: string;
    topic?: string;
    publishedAt: string | null;
    status: "published" | "pending" | "scheduled";
  }>;
}

const contentIcons = {
  news: <Newspaper className="w-5 h-5" />,
  lesson: <BookOpen className="w-5 h-5" />,
  moltbook: <MessageSquare className="w-5 h-5" />,
};

const contentLabels = {
  news: "AI News",
  lesson: "Lesson",
  moltbook: "Moltbook",
};

const contentColors = {
  news: "text-[var(--info)]",
  lesson: "text-[var(--success)]",
  moltbook: "text-[var(--accent-mango)]",
};

function StatusBadge({ status }: { status: string }) {
  const styles = {
    published: "bg-[var(--success)]/20 text-[var(--success)]",
    pending: "bg-[var(--warning)]/20 text-[var(--warning)]",
    scheduled: "bg-[var(--info)]/20 text-[var(--info)]",
  };

  const icons = {
    published: <CheckCircle className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />,
    scheduled: <Clock className="w-3 h-3" />,
  };

  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${styles[status as keyof typeof styles] || styles.pending}`}>
      {icons[status as keyof typeof icons]}
    </span>
  );
}

export default function ContentSnapshot() {
  const { data, error } = useSWR<ContentSnapshotData>(
    "/api/content-snapshot",
    fetcher,
    { refreshInterval: 60000 }
  );

  const isLoading = !data;

  // 최근 콘텐츠 가져오기
  const getContent = (type: string) => {
    return data?.recentContent?.find(c => c.type === type);
  };

  const types = ["news", "lesson", "moltbook"] as const;

  return (
    <Widget 
      title="Content Snapshot" 
      icon="📈"
      mangoPick="AI 뉴스는 매일 아침 7시에 발행됩니다"
      loading={isLoading}
    >
      <div className="space-y-3">
        {/* 최근 콘텐츠 3개만 표시 */}
        {types.map((type) => {
          const content = getContent(type);
          return (
            <div 
              key={type}
              className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className={contentColors[type]}>
                  {contentIcons[type]}
                </div>
                <div>
                  <div className="text-xs text-[var(--text-secondary)] mb-0.5">
                    {contentLabels[type]}
                  </div>
                  <div className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[180px]">
                    {content?.title || content?.topic || "준비중..."}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={content?.status || "pending"} />
                {content?.publishedAt && (
                  <span className="text-xs text-[var(--text-secondary)]">
                    {formatRelativeTime(new Date(content.publishedAt))}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* 에러 메시지 */}
        {error && (
          <div className="text-sm text-[var(--error)] text-center">
            데이터를 불러올 수 없습니다
          </div>
        )}
      </div>
    </Widget>
  );
}

"use client";

import useSWR from "swr";
import { Newspaper, BookOpen, MessageSquare, Linkedin, CheckCircle, Clock, Circle } from "lucide-react";
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
    channel?: string;
  }>;
  linkedin: {
    current: number;
    total: number;
    status: string;
    next: number;
    nextTitle: string;
    nextScheduledAt: string;
  };
}

const contentIcons = {
  news: <Newspaper className="w-5 h-5" />,
  lesson: <BookOpen className="w-5 h-5" />,
  moltbook: <MessageSquare className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
};

const contentLabels = {
  news: "AI News",
  lesson: "Lesson",
  moltbook: "Moltbook",
  linkedin: "LinkedIn",
};

function StatusBadge({ status }: { status: string }) {
  const styles = {
    published: "bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/30",
    pending: "bg-[var(--warning)]/20 text-[var(--warning)] border-[var(--warning)]/30",
    scheduled: "bg-[var(--info)]/20 text-[var(--info)] border-[var(--info)]/30",
  };

  const icons = {
    published: <CheckCircle className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />,
    scheduled: <Clock className="w-3 h-3" />,
  };

  const labels = {
    published: "Done",
    pending: "Pending",
    scheduled: "Scheduled",
  };

  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.pending}`}>
      {icons[status as keyof typeof icons]}
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

function ContentCard({ 
  type, 
  title, 
  topic, 
  publishedAt, 
  status 
}: { 
  type: string; 
  title?: string; 
  topic?: string; 
  publishedAt: string | null; 
  status: string;
}) {
  return (
    <div className="flex flex-col p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)] h-36">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 text-[var(--accent-mango)]">
          {contentIcons[type as keyof typeof contentIcons]}
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {contentLabels[type as keyof typeof contentLabels]}
          </span>
        </div>
        <StatusBadge status={status} />
      </div>
      
      <div className="flex-1">
        <p className="text-sm text-[var(--text-primary)] line-clamp-2">
          {title || topic || "준비중..."}
        </p>
      </div>
      
      <div className="text-xs text-[var(--text-secondary)] mt-2">
        {publishedAt ? formatRelativeTime(new Date(publishedAt)) : "예약중"}
      </div>
    </div>
  );
}

export default function ContentSnapshot() {
  const { data, error } = useSWR<ContentSnapshotData>(
    "/api/content-snapshot",
    fetcher,
    { refreshInterval: 60000 }
  );

  const isLoading = !data;

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-5 widget-card">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📈</span>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Content Snapshot
          </h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-[var(--border-subtle)] rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Widget 
      title="Content Snapshot" 
      icon="📈"
      className="lg:col-span-2"
    >
      <div className="space-y-4">
        {/* Content Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* News Card */}
          <ContentCard 
            type="news"
            title={data?.recentContent.find(c => c.type === "news")?.title}
            publishedAt={data?.recentContent.find(c => c.type === "news")?.publishedAt || null}
            status={data?.recentContent.find(c => c.type === "news")?.status || "pending"}
          />
          
          {/* Lesson Card */}
          <ContentCard 
            type="lesson"
            topic={data?.recentContent.find(c => c.type === "lesson")?.topic}
            publishedAt={data?.recentContent.find(c => c.type === "lesson")?.publishedAt || null}
            status={data?.recentContent.find(c => c.type === "lesson")?.status || "pending"}
          />
          
          {/* Moltbook Card */}
          <ContentCard 
            type="moltbook"
            title={data?.recentContent.find(c => c.type === "moltbook")?.title}
            publishedAt={data?.recentContent.find(c => c.type === "moltbook")?.publishedAt || null}
            status={data?.recentContent.find(c => c.type === "moltbook")?.status || "pending"}
          />
          
          {/* LinkedIn Card */}
          <div className="flex flex-col p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)] h-36">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 text-[var(--accent-mango)]">
                <Linkedin className="w-5 h-5" />
                <span className="text-sm font-medium text-[var(--text-primary)]">LinkedIn</span>
              </div>
              <StatusBadge status={data?.linkedin.status || "pending"} />
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-1 text-lg font-bold text-[var(--text-primary)]">
                <span className="text-[var(--accent-mango)]">#{data?.linkedin.current}</span>
                <span className="text-[var(--text-secondary)] text-sm">/ {data?.linkedin.total}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1">
                {data?.linkedin.nextTitle}
              </p>
            </div>
            
            <div className="text-xs text-[var(--text-secondary)] mt-2">
              Next: {data ? formatRelativeTime(new Date(data.linkedin.nextScheduledAt)) : "--"}
            </div>
          </div>
        </div>

        {/* LinkedIn Progress Bar */}
        <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-3">
            <Linkedin className="w-4 h-4 text-[var(--info)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              LinkedIn Writing Progress
            </span>
          </div>
          
          {/* Progress Numbers */}
          <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-2">
            {data && [...Array(Math.min(10, data.linkedin.total))].map((_, i) => {
              const num = i + 1;
              const isCompleted = num <= data.linkedin.current;
              const isNext = num === data.linkedin.next;
              
              return (
                <div 
                  key={num}
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium ${
                    isCompleted 
                      ? "bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30" 
                      : isNext
                      ? "bg-[var(--warning)]/20 text-[var(--warning)] border border-[var(--warning)]/30 animate-pulse"
                      : "bg-[var(--border-subtle)] text-[var(--text-secondary)]"
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : num}
                </div>
              );
            })}
            {data && data.linkedin.total > 10 && (
              <span className="text-xs text-[var(--text-secondary)] px-2">
                ... +{data.linkedin.total - 10} more
              </span>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-[var(--border-subtle)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--accent-mango)] rounded-full transition-all"
              style={{ width: data ? `${(data.linkedin.current / data.linkedin.total) * 100}%` : "0%" }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-[var(--text-secondary)]">
            <span>{data ? `${data.linkedin.current} complete` : "--"}</span>
            <span>{data ? `${((data.linkedin.current / data.linkedin.total) * 100).toFixed(0)}%` : "--"}</span>
          </div>
        </div>
      </div>
    </Widget>
  );
}

"use client";

import useSWR from "swr";
import { AlertTriangle, Github, RefreshCw, Clock } from "lucide-react";
import Widget from "../Widget";
import { formatRelativeTime } from "../../lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface KnowledgeQueueData {
  obsidian: {
    lastBackup: string;
    syncStatus: "ok" | "needed";
  };
  retention: {
    review: number;
    keep: number;
    discard: number;
  };
  github: {
    openPRs: number;
    openIssues: number;
    items: Array<{
      type: string;
      number: number;
      title: string;
      createdAt: string;
      url: string;
    }>;
  };
}

function CountCard({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-20 h-20 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)]">
      <span className={`text-2xl font-bold ${color}`}>{count}</span>
      <span className="text-xs text-[var(--text-secondary)] mt-1">{label}</span>
    </div>
  );
}

export default function KnowledgeQueue() {
  const { data, error } = useSWR<KnowledgeQueueData>(
    "/api/knowledge-queue",
    fetcher,
    { refreshInterval: 60000 }
  );

  const isLoading = !data;

  return (
    <Widget 
      title="Knowledge Queue" 
      icon="📚"
      loading={isLoading}
    >
      <div className="space-y-4">
        {/* Count Cards */}
        <div className="flex justify-center gap-3">
          <CountCard count={data?.retention.review || 0} label="Review" color="text-[var(--warning)]" />
          <CountCard count={data?.retention.keep || 0} label="Keep" color="text-[var(--success)]" />
          <CountCard count={data?.retention.discard || 0} label="Discard" color="text-[var(--text-secondary)]" />
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-subtle)]"></div>

        {/* Alerts Section */}
        <div>
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
            Actions Needed
          </h3>
          
          {/* Obsidian Sync */}
          {data?.obsidian.syncStatus === "needed" && (
            <div className="flex items-center justify-between p-3 bg-[var(--bg-elevated)] rounded-lg mb-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[var(--warning)]" />
                <div>
                  <div className="text-sm text-[var(--text-primary)]">Obsidian sync needed</div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    Last backup: {formatRelativeTime(new Date(data.obsidian.lastBackup))}
                  </div>
                </div>
              </div>
              <button className="px-3 py-1 text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded hover:bg-[var(--bg-elevated)] transition-colors">
                Sync Now
              </button>
            </div>
          )}

          {/* GitHub PRs */}
          {data?.github.openPRs && data.github.openPRs > 0 && (
            <div className="flex items-center justify-between p-3 bg-[var(--bg-elevated)] rounded-lg">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-[var(--info)]" />
                <div>
                  <div className="text-sm text-[var(--text-primary)]">
                    {data.github.openPRs} open PR{data.github.openPRs > 1 ? 's' : ''}
                  </div>
                  {data.github.items.length > 0 && (
                    <div className="text-xs text-[var(--text-secondary)] truncate max-w-[200px]">
                      #{data.github.items[0].number} "{data.github.items[0].title}"
                    </div>
                  )}
                </div>
              </div>
              <a 
                href={data.github.items[0]?.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1 text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded hover:bg-[var(--bg-elevated)] transition-colors"
              >
                View
              </a>
            </div>
          )}
        </div>

        {/* Next Backup Info */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <Clock className="w-3 h-3" />
          <span>Next scheduled backup: 18:00 KST</span>
        </div>
      </div>
    </Widget>
  );
}

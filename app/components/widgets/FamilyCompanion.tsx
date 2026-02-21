"use client";

import useSWR from "swr";
import { Clock, MessageCircle, Calendar } from "lucide-react";
import Widget from "../Widget";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface FamilyCompanionData {
  progress: {
    currentWeek: number;
    totalWeeks: number;
    percentage: number;
  };
  todayActivity: {
    questionsUsed: number;
    questionsTotal: number;
    responses: Array<{
      type: string;
      status: string;
      label: string;
      emoji: string;
    }>;
  };
  modules: Array<{
    id: string;
    status: string;
    label: string;
    icon: string;
  }>;
  nextScheduled: {
    time: string;
    label: string;
    today: boolean;
  };
}

export default function FamilyCompanion() {
  const { data, error } = useSWR<FamilyCompanionData>(
    "/api/family-companion/status",
    fetcher,
    { refreshInterval: 60000 }
  );

  const isLoading = !data;

  return (
    <Widget 
      title="Family Companion" 
      icon="👨‍👩‍👧"
      loading={isLoading}
    >
      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[var(--text-secondary)]">
              Week {data?.progress.currentWeek ?? "--"} of {data?.progress.totalWeeks ?? "--"}
            </span>
            <span className="text-xs font-medium text-[var(--text-primary)]">
              {data?.progress.percentage ?? "--"}%
            </span>
          </div>
          <div className="h-2 bg-[var(--border-subtle)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--accent-mango)] rounded-full transition-all"
              style={{ width: `${data?.progress.percentage ?? 0}%` }}
            ></div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-subtle)]"></div>

        {/* Today's Activity */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-[var(--text-secondary)]" />
            <h3 className="text-xs font-medium text-[var(--text-secondary)]">
              Today&apos;s Activity
            </h3>
          </div>
          <div className="p-2 bg-[var(--bg-elevated)] rounded-lg mb-2">
            <div className="text-sm text-[var(--text-primary)]">
              질문 {data?.todayActivity.questionsUsed ?? "--"}/{data?.todayActivity.questionsTotal ?? "--"} 사용
            </div>
          </div>
          <div className="space-y-1.5">
            {data?.todayActivity.responses.map((response, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-[var(--bg-elevated)] rounded-lg"
              >
                <span className="text-sm text-[var(--text-secondary)]">
                  {response.type} 응답
                </span>
                <div className="flex items-center gap-1.5">
                  <span>{response.emoji}</span>
                  <span className="text-sm text-[var(--text-primary)]">
                    {response.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-subtle)]"></div>

        {/* Modules Status */}
        <div>
          <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2">
            Modules
          </h3>
          <div className="flex gap-2">
            {data?.modules.map((module, index) => (
              <div 
                key={index}
                className="flex-1 p-2 bg-[var(--bg-elevated)] rounded-lg text-center"
              >
                <div className="text-lg mb-0.5">{module.icon}</div>
                <div className="text-xs font-medium text-[var(--text-primary)]">
                  {module.id}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {module.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-subtle)]"></div>

        {/* Next Scheduled */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
            <h3 className="text-xs font-medium text-[var(--text-secondary)]">
              Next Scheduled
            </h3>
          </div>
          <div className="flex items-center gap-3 p-2 bg-[var(--bg-elevated)] rounded-lg">
            <Clock className="w-4 h-4 text-[var(--accent-mango)]" />
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {data?.nextScheduled.today ? "오늘" : "내일"} {data?.nextScheduled.time} {data?.nextScheduled.label} 예정
              </div>
            </div>
          </div>
        </div>
      </div>
    </Widget>
  );
}

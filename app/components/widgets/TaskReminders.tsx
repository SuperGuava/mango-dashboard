"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Trash2,
  Play,
  X
} from "lucide-react";
import Widget from "../Widget";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Task {
  id: string;
  name: string;
  status: "completed" | "pending" | "running";
  type: "cron" | "manual";
  lastRun?: string;
  scheduledAt?: string;
  description?: string;
}

interface CronStatusData {
  last24h: {
    total: number;
    success: number;
    failed: number;
  };
  recent: Array<{
    name: string;
    schedule: string;
    lastRun: string;
    status: "success" | "failed" | "running";
  }>;
  next: Array<{
    name: string;
    scheduledAt: string;
    countdown: number;
  }>;
}

// Cron 작업을 Task 형식으로 변환
function mapCronToTasks(cronData: CronStatusData): Task[] {
  const tasks: Task[] = [];
  
  // Recent 작업
  cronData.recent.forEach((item, index) => {
    tasks.push({
      id: `cron-recent-${index}`,
      name: item.name,
      status: item.status === "success" ? "completed" : item.status === "running" ? "running" : "pending",
      type: "cron",
      lastRun: item.lastRun,
      description: item.schedule,
    });
  });
  
  // Next 작업
  cronData.next.forEach((item, index) => {
    tasks.push({
      id: `cron-next-${index}`,
      name: item.name,
      status: "pending",
      type: "cron",
      scheduledAt: item.scheduledAt,
    });
  });
  
  return tasks;
}

// 시간 포맷팅
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return "방금";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

// 예정 시간 포맷팅
function formatScheduledTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMs < 0) return "지연됨";
  if (diffMins < 60) return `${diffMins}분 후`;
  if (diffHours < 24) return `${diffHours}시간 후`;
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function TaskReminders() {
  const { data: cronData, error, isLoading } = useSWR<CronStatusData>(
    "/api/cron-status",
    fetcher,
    { refreshInterval: 60000 }
  );
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  // Cron 데이터와 수동 태스크 병합
  const allTasks: Task[] = [
    ...(cronData ? mapCronToTasks(cronData) : []),
    ...tasks,
  ].slice(0, 10); // 최대 10개

  // 통계
  const completedCount = allTasks.filter(t => t.status === "completed").length;
  const pendingCount = allTasks.filter(t => t.status === "pending").length;
  const runningCount = allTasks.filter(t => t.status === "running").length;

  // 체크박스 토글
  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: task.status === "completed" ? "pending" : "completed",
        };
      }
      return task;
    }));
  };

  // 수동 태스크 추가
  const addManualTask = async () => {
    if (!newTaskName.trim()) return;
    
    const newTask: Task = {
      id: `manual-${Date.now()}`,
      name: newTaskName.trim(),
      status: "pending",
      type: "manual",
      description: newTaskDesc.trim() || undefined,
    };
    
    setTasks(prev => [newTask, ...prev].slice(0, 10));
    setNewTaskName("");
    setNewTaskDesc("");
    setShowAddModal(false);
  };

  // 수동 태스크 삭제
  const deleteManualTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  return (
    <Widget 
      title="할일 & 리마인더" 
      icon="📋"
      mangoPick="완료 대기 중인 작업을 확인하세요"
      loading={isLoading}
    >
      <div className="space-y-4">
        {/* 통계 요약 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-[var(--bg-elevated)] rounded-xl text-center">
            <div className="text-lg font-bold text-[var(--success)]">{completedCount}</div>
            <div className="text-xs text-[var(--text-secondary)]">완료</div>
          </div>
          <div className="p-3 bg-[var(--bg-elevated)] rounded-xl text-center">
            <div className="text-lg font-bold text-[var(--warning)]">{pendingCount}</div>
            <div className="text-xs text-[var(--text-secondary)]">대기</div>
          </div>
          <div className="p-3 bg-[var(--bg-elevated)] rounded-xl text-center">
            <div className="text-lg font-bold text-[var(--accent-mango)]">{runningCount}</div>
            <div className="text-xs text-[var(--text-secondary)]">실행중</div>
          </div>
        </div>

        {/* 24시간 통계 */}
        {cronData?.last24h && (
          <div className="p-3 bg-[var(--bg-elevated)] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[var(--accent-mango)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">최근 24시간</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">총 작업</span>
              <span className="font-semibold text-[var(--text-primary)]">{cronData.last24h.total}개</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-[var(--success)]">성공</span>
              <span className="font-semibold text-[var(--success)]">{cronData.last24h.success}개</span>
            </div>
            {cronData.last24h.failed > 0 && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-[var(--error)]">실패</span>
                <span className="font-semibold text-[var(--error)]">{cronData.last24h.failed}개</span>
              </div>
            )}
          </div>
        )}

        {/* 태스크 목록 */}
        <div className="space-y-2 max-h-[240px] overflow-y-auto">
          {allTasks.length === 0 ? (
            <div className="text-center py-6 text-[var(--text-secondary)] text-sm">
              등록된 작업이 없습니다
            </div>
          ) : (
            allTasks.map((task) => (
              <div 
                key={task.id}
                className={`flex items-center gap-3 p-3 bg-[var(--bg-elevated)] rounded-xl group ${
                  task.status === "completed" ? "opacity-60" : ""
                }`}
              >
                {/* 체크박스 */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex-shrink-0"
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                  ) : task.status === "running" ? (
                    <Play className="w-5 h-5 text-[var(--accent-mango)] animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--text-secondary)] hover:text-[var(--accent-mango)]" />
                  )}
                </button>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${
                    task.status === "completed" ? "line-through text-[var(--text-secondary)]" : "text-[var(--text-primary)]"
                  }`}>
                    {task.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    {task.type === "cron" ? (
                      <>
                        <span className="px-1.5 py-0.5 bg-[var(--accent-mango)]/20 text-[var(--accent-mango)] rounded">Cron</span>
                        {task.lastRun && <span>{formatTime(task.lastRun)}</span>}
                        {task.scheduledAt && <span>{formatScheduledTime(task.scheduledAt)}</span>}
                        {task.description && <span className="font-mono">{task.description}</span>}
                      </>
                    ) : (
                      <>
                        <span className="px-1.5 py-0.5 bg-[var(--success)]/20 text-[var(--success)] rounded">수동</span>
                        {task.description && <span className="truncate">{task.description}</span>}
                      </>
                    )}
                  </div>
                </div>

                {/* 삭제 버튼 (수동 태스크만) */}
                {task.type === "manual" && (
                  <button
                    onClick={() => deleteManualTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-secondary)] hover:text-[var(--error)] transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* 추가 버튼 */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent-mango)]/10 hover:bg-[var(--accent-mango)]/20 text-[var(--accent-mango)] rounded-xl transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          할일 추가
        </button>

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-[var(--error)]/10 text-[var(--error)] rounded-xl text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>데이터를 불러올 수 없습니다</span>
          </div>
        )}
      </div>

      {/* 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">할일 추가</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">작업명</label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addManualTask()}
                  placeholder="예: 코드 리뷰, 문서 작성..."
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-mango)]"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">설명 (선택)</label>
                <input
                  type="text"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="추가 설명..."
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-mango)]"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-[var(--bg-elevated)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--border-subtle)] transition-colors"
              >
                취소
              </button>
              <button
                onClick={addManualTask}
                disabled={!newTaskName.trim()}
                className="flex-1 px-4 py-2 bg-[var(--accent-mango)] text-white rounded-lg hover:bg-[var(--accent-mango)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </Widget>
  );
}

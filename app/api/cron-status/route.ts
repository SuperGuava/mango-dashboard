import { NextResponse } from "next/server";
import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// 환경 감지: 로컬 vs Vercel
const isLocal = !process.env.VERCEL || process.env.DASHBOARD_MODE === 'local';
const isDev = process.env.NODE_ENV === 'development';

// OpenClaw 로그 디렉토리 경로
const LOGS_DIR = process.env.OPENCLAW_LOGS_DIR || "/home/ninefire/.openclaw/logs";

// Mock 데이터 (Vercel 환경용)
const getMockData = () => {
  const now = new Date();
  const nextLesson = new Date(now);
  nextLesson.setDate(nextLesson.getDate() + 1);
  nextLesson.setHours(8, 0, 0, 0);
  
  const countdown = Math.floor((nextLesson.getTime() - now.getTime()) / 1000);
  
  return {
    last24h: {
      total: 5,
      success: 4,
      failed: 1,
    },
    recent: [
      {
        name: "AI News Briefing",
        schedule: "0 6 * * *",
        lastRun: new Date(now.setHours(6, 0, 0, 0)).toISOString(),
        status: "success" as const,
      },
    ],
    next: [
      {
        name: "1분 AI 레슨",
        scheduledAt: nextLesson.toISOString(),
        countdown: countdown,
      },
    ],
    mock: true,
    message: "Running in Vercel mode - Mock data",
  };
};

interface CronJobInfo {
  name: string;
  schedule: string;
  lastRun: string | null;
  status: "success" | "failed" | "running";
  logCount?: number;
}

// 로그 파일 파싱
async function parseLogFile(filePath: string): Promise<{ lastRun: string | null; status: "success" | "failed" | "running"; count: number }> {
  try {
    const content = await readFile(filePath, "utf-8");
    const lines = content.split("\n").filter(Boolean);
    const lastLine = lines[lines.length - 1];
    
    // 타임스탬프 추출
    const timestampMatch = lastLine?.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
    const lastRun = timestampMatch ? timestampMatch[1] : null;
    
    // 에러 확인
    const recentLines = lines.slice(-20);
    const hasError = recentLines.some(line => 
      line.toLowerCase().includes("error") || 
      line.toLowerCase().includes("failed")
    );
    
    return {
      lastRun,
      status: hasError ? "failed" : "success",
      count: lines.length,
    };
  } catch (error) {
    return { lastRun: null, status: "failed", count: 0 };
  }
}

// 로컬 크론 작업 상태 수집
async function getLocalCronStatus() {
  const cronJobs: CronJobInfo[] = [];
  const now = new Date();
  
  try {
    if (existsSync(LOGS_DIR)) {
      const files = await readdir(LOGS_DIR);
      const logFiles = files.filter(f => f.endsWith('.log'));
      
      // 로그 파일 기반 작업 목록
      for (const file of logFiles) {
        const filePath = join(LOGS_DIR, file);
        const { lastRun, status, count } = await parseLogFile(filePath);
        
        // 파일명에서 작업명 추출
        const jobName = file
          .replace('.log', '')
          .replace(/_/g, ' ')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        
        cronJobs.push({
          name: jobName,
          schedule: "*/30 * * * *", // 기본값 (실제 크론 설정에서 읽어오면 더 좋음)
          lastRun,
          status,
          logCount: count,
        });
      }
    }
    
    // 기본 작업이 없으면 기본값 추가
    if (cronJobs.length === 0) {
      cronJobs.push(
        { name: "AI News Briefing", schedule: "0 6 * * *", lastRun: null, status: "success" },
        { name: "Health Check", schedule: "*/30 * * * *", lastRun: null, status: "success" },
        { name: "Log Cleanup", schedule: "0 0 * * *", lastRun: null, status: "success" }
      );
    }
  } catch (error) {
    console.error("Error reading cron status:", error);
  }
  
  // 최근 실행 작업과 다음 예정 작업 분리
  const recent = cronJobs
    .filter(j => j.lastRun)
    .sort((a, b) => new Date(b.lastRun!).getTime() - new Date(a.lastRun!).getTime())
    .slice(0, 5);
  
  const next = cronJobs
    .filter(j => !j.lastRun || new Date(j.lastRun).getTime() < now.getTime() - 3600000)
    .slice(0, 3)
    .map(j => ({
      name: j.name,
      scheduledAt: new Date(now.getTime() + 3600000).toISOString(),
      countdown: 3600,
    }));
  
  // 24시간 통계 계산
  const last24h = {
    total: recent.length,
    success: recent.filter(j => j.status === "success").length,
    failed: recent.filter(j => j.status === "failed").length,
  };
  
  return {
    last24h,
    recent: recent.map(j => ({
      name: j.name,
      schedule: j.schedule,
      lastRun: j.lastRun || now.toISOString(),
      status: j.status,
    })),
    next,
    local: true,
    logDirectory: LOGS_DIR,
  };
}

export async function GET() {
  // Vercel 환경: Mock 데이터 반환
  if (!isLocal && !isDev) {
    return NextResponse.json(getMockData());
  }
  
  // 로컬 환경: 실제 데이터 수집
  try {
    const data = await getLocalCronStatus();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Cron status error:", error);
    
    // 에러 시 Mock 데이터로 폴백
    return NextResponse.json({
      ...getMockData(),
      fallback: true,
      error: "Failed to get local cron status",
    });
  }
}

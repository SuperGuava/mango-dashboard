import { NextResponse } from "next/server";
import { readFile, readdir, stat } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// 환경 감지: 로컬 vs Vercel
const isLocal = !process.env.VERCEL || process.env.DASHBOARD_MODE === 'local';
const isDev = process.env.NODE_ENV === 'development';

// OpenClaw 로그 디렉토리 경로
const LOGS_DIR = process.env.OPENCLAW_LOGS_DIR || "/home/ninefire/.openclaw/logs";

// Mock 데이터 (Vercel 환경용)
const mockData = {
  gateway: {
    status: "online" as const,
    lastChecked: new Date().toISOString(),
    uptime: "running",
    errors: [],
  },
  cronJobs: [
    { name: "AI News Briefing", lastRun: new Date().toISOString(), status: "success" as const, logCount: 150, recentErrors: 0 },
    { name: "Knowledge Sync", lastRun: new Date(Date.now() - 3600000).toISOString(), status: "success" as const, logCount: 89, recentErrors: 1 },
    { name: "Health Check", lastRun: new Date(Date.now() - 7200000).toISOString(), status: "success" as const, logCount: 200, recentErrors: 0 },
  ],
  gptUsage: {
    estimatedTokens: 45000,
    estimatedCost: 0.09,
    last24hCalls: 89,
    lastReset: new Date().toISOString(),
  },
  logFiles: [
    { name: "gateway-cleaner.log", size: 102400, modified: new Date().toISOString() },
    { name: "ai-news.log", size: 51200, modified: new Date(Date.now() - 3600000).toISOString() },
  ],
};

// 로그 파일 항목 타입
interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
  source?: string;
}

// 크론 작업 상태 타입
interface CronJobStatus {
  name: string;
  lastRun: string | null;
  status: "success" | "error" | "running" | "unknown";
  logCount: number;
  recentErrors: number;
}

// GPT 사용량 추정 타입
interface GPTUsage {
  estimatedTokens: number;
  estimatedCost: number;
  last24hCalls: number;
  lastReset: string | null;
}

// 게이트웨이 상태 타입
interface GatewayStatus {
  status: "online" | "offline" | "unknown";
  lastChecked: string | null;
  uptime: string | null;
  errors: string[];
}

// openclaw 명령어 실행하여 상태 확인
async function getOpenClawStatus(): Promise<GatewayStatus> {
  try {
    // openclaw gateway status 명령 실행
    const { stdout } = await execAsync('openclaw gateway status 2>/dev/null || echo "unknown"');
    const output = stdout.trim();
    
    const isOnline = output.includes('running') || output.includes('online') || output.includes('active');
    
    return {
      status: isOnline ? "online" : "offline",
      lastChecked: new Date().toISOString(),
      uptime: isOnline ? "running" : null,
      errors: [],
    };
  } catch (error) {
    // 명령어 실패 시 로그 기반 파싱으로 폴백
    return parseGatewayStatus();
  }
}

// 로그 파일 파싱 함수
async function parseLogFile(filePath: string, limit: number = 100): Promise<LogEntry[]> {
  try {
    const content = await readFile(filePath, "utf-8");
    const lines = content.split("\n").filter(Boolean).slice(-limit);

    return lines.map((line) => {
      // 기본 로그 형식: "YYYY-MM-DD HH:MM:SS - message"
      const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+-\s+(.+)$/);

      if (timestampMatch) {
        const [, timestamp, message] = timestampMatch;
        const level: LogEntry["level"] =
          message.toLowerCase().includes("error") ? "error" :
          message.toLowerCase().includes("warn") ? "warn" :
          message.toLowerCase().includes("success") || message.toLowerCase().includes("completed") ? "success" :
          "info";

        return { timestamp, message, level };
      }

      // 타임스탬프 없는 경우
      return {
        timestamp: new Date().toISOString(),
        message: line,
        level: "info" as const,
      };
    });
  } catch (error) {
    return [];
  }
}

// 게이트웨이 상태 파싱
async function parseGatewayStatus(): Promise<GatewayStatus> {
  const gatewayLogPath = join(LOGS_DIR, "gateway-cleaner.log");

  if (!existsSync(gatewayLogPath)) {
    return {
      status: "unknown",
      lastChecked: null,
      uptime: null,
      errors: [],
    };
  }

  const entries = await parseLogFile(gatewayLogPath, 50);
  const recentEntries = entries.slice(-10);

  const lastHealthy = recentEntries.find((e) =>
    e.message.toLowerCase().includes("gateway is healthy")
  );

  const errors = recentEntries
    .filter((e) => e.level === "error" || e.message.toLowerCase().includes("warning"))
    .map((e) => e.message);

  const lastChecked = recentEntries.length > 0
    ? recentEntries[recentEntries.length - 1].timestamp
    : null;

  return {
    status: lastHealthy ? "online" : "offline",
    lastChecked,
    uptime: lastHealthy ? "running" : null,
    errors: errors.slice(-5),
  };
}

// 크론 작업 상태 파싱
async function parseCronJobs(): Promise<CronJobStatus[]> {
  const cronJobs: CronJobStatus[] = [];

  try {
    const files = await readdir(LOGS_DIR);
    const logFiles = files.filter((f) => f.endsWith(".log"));

    for (const file of logFiles) {
      const filePath = join(LOGS_DIR, file);
      const entries = await parseLogFile(filePath, 200);

      if (entries.length === 0) continue;

      const lastEntry = entries[entries.length - 1];
      const errorCount = entries.slice(-50).filter(
        (e) => e.level === "error" || e.message.toLowerCase().includes("error")
      ).length;

      const jobName = file.replace(".log", "").replace(/_/g, " ");

      cronJobs.push({
        name: jobName,
        lastRun: lastEntry.timestamp,
        status: errorCount > 5 ? "error" : errorCount > 0 ? "success" : "success",
        logCount: entries.length,
        recentErrors: errorCount,
      });
    }
  } catch (error) {
    console.error("Error parsing cron jobs:", error);
  }

  return cronJobs.sort((a, b) =>
    new Date(b.lastRun || 0).getTime() - new Date(a.lastRun || 0).getTime()
  ).slice(0, 10);
}

// GPT 사용량 추정 (로그 기반)
async function estimateGPTUsage(): Promise<GPTUsage> {
  try {
    const files = await readdir(LOGS_DIR);
    const allEntries: LogEntry[] = [];

    for (const file of files.slice(0, 5)) {
      const filePath = join(LOGS_DIR, file);
      const entries = await parseLogFile(filePath, 50);
      allEntries.push(...entries);
    }

    // 최근 24시간 항목 필터링
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEntries = allEntries.filter(
      (e) => new Date(e.timestamp) > last24h
    );

    // 대략적인 추정 (로그 라인당 평균 토큰 사용량 가정)
    const estimatedTokens = recentEntries.length * 500;
    const estimatedCost = estimatedTokens * 0.000002; // GPT-4 대략적인 비용

    return {
      estimatedTokens,
      estimatedCost: parseFloat(estimatedCost.toFixed(4)),
      last24hCalls: recentEntries.length,
      lastReset: new Date().toISOString(),
    };
  } catch (error) {
    return {
      estimatedTokens: 0,
      estimatedCost: 0,
      last24hCalls: 0,
      lastReset: null,
    };
  }
}

// 로그 파일 목록 가져오기
async function getLogFiles(): Promise<Array<{ name: string; size: number; modified: string }>> {
  try {
    const files = await readdir(LOGS_DIR);
    const logFiles = files.filter((f) => f.endsWith(".log"));

    const fileStats = await Promise.all(
      logFiles.map(async (file) => {
        const filePath = join(LOGS_DIR, file);
        const stats = await stat(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime.toISOString(),
        };
      })
    );

    return fileStats.sort(
      (a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime()
    );
  } catch (error) {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "summary";

  // Vercel 환경: Mock 데이터 반환
  if (!isLocal && !isDev) {
    if (type === "summary") {
      return NextResponse.json({
        success: true,
        mock: true,
        message: "Running in Vercel mode - Mock data",
        data: mockData,
        lastUpdated: new Date().toISOString(),
      });
    }
    // 다른 타입에도 Mock 데이터 반환
    return NextResponse.json({
      success: true,
      mock: true,
      data: type === "gateway" ? mockData.gateway : 
            type === "cron" ? mockData.cronJobs :
            type === "logs" ? mockData.logFiles : mockData,
      lastUpdated: new Date().toISOString(),
    });
  }

  // 로컬 환경: 실제 데이터 수집
  
  // 로그 디렉토리 확인
  if (!existsSync(LOGS_DIR)) {
    return NextResponse.json({
      success: false,
      error: "Logs directory not found",
      fallback: true,
      data: {
        gateway: { status: "unknown", lastChecked: null, uptime: null, errors: [] },
        cronJobs: [],
        gptUsage: { estimatedTokens: 0, estimatedCost: 0, last24hCalls: 0, lastReset: null },
        logFiles: [],
      },
      lastUpdated: new Date().toISOString(),
    });
  }

  try {
    if (type === "summary") {
      // 로컬에서는 openclaw 명령어도 시도
      const [gatewayStatus, cronJobs, gptUsage, logFiles] = await Promise.all([
        getOpenClawStatus(),
        parseCronJobs(),
        estimateGPTUsage(),
        getLogFiles(),
      ]);

      return NextResponse.json({
        success: true,
        local: true,
        data: {
          gateway: gatewayStatus,
          cronJobs,
          gptUsage,
          logFiles: logFiles.slice(0, 10),
          logDirectory: LOGS_DIR,
        },
        lastUpdated: new Date().toISOString(),
      });
    } else if (type === "gateway") {
      const gateway = await getOpenClawStatus();
      return NextResponse.json({
        success: true,
        local: true,
        data: gateway,
        lastUpdated: new Date().toISOString(),
      });
    } else if (type === "cron") {
      const cronJobs = await parseCronJobs();
      return NextResponse.json({
        success: true,
        local: true,
        data: cronJobs,
        lastUpdated: new Date().toISOString(),
      });
    } else if (type === "logs") {
      const logFiles = await getLogFiles();
      return NextResponse.json({
        success: true,
        local: true,
        data: logFiles,
        lastUpdated: new Date().toISOString(),
      });
    } else if (type === "file") {
      const fileName = searchParams.get("name");
      if (!fileName) {
        return NextResponse.json(
          { success: false, error: "File name required" },
          { status: 400 }
        );
      }

      const filePath = join(LOGS_DIR, fileName);
      if (!existsSync(filePath)) {
        return NextResponse.json(
          { success: false, error: "File not found" },
          { status: 404 }
        );
      }

      const entries = await parseLogFile(filePath, 100);
      return NextResponse.json({
        success: true,
        local: true,
        data: {
          fileName,
          entries,
        },
        lastUpdated: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid type parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("OpenClaw log parsing error:", error);

    return NextResponse.json({
      success: false,
      error: "Failed to parse OpenClaw logs",
      fallback: true,
      data: {
        gateway: { status: "unknown", lastChecked: null, uptime: null, errors: [] },
        cronJobs: [],
        gptUsage: { estimatedTokens: 0, estimatedCost: 0, last24hCalls: 0, lastReset: null },
        logFiles: [],
      },
      lastUpdated: new Date().toISOString(),
    });
  }
}

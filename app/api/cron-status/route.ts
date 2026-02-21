import { NextResponse } from "next/server";

export async function GET() {
  // Mock data for cron job status
  const now = new Date();
  const nextLesson = new Date(now);
  nextLesson.setDate(nextLesson.getDate() + 1);
  nextLesson.setHours(8, 0, 0, 0);
  
  const countdown = Math.floor((nextLesson.getTime() - now.getTime()) / 1000);
  
  return NextResponse.json({
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
        status: "success",
      },
    ],
    next: [
      {
        name: "1분 AI 레슨",
        scheduledAt: nextLesson.toISOString(),
        countdown: countdown,
      },
    ],
  });
}

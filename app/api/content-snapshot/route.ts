import { NextResponse } from "next/server";

export async function GET() {
  // Mock data for content snapshot
  return NextResponse.json({
    recentContent: [
      {
        type: "news",
        title: "실리콘밸리 AI 동향",
        publishedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        status: "published",
        channel: "telegram",
      },
      {
        type: "lesson",
        topic: "프롬프트 설계",
        publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        status: "published",
      },
      {
        type: "moltbook",
        title: "AI 질문 준비중",
        publishedAt: null,
        status: "pending",
      },
    ],
    moltbook: {
      recentPosts: 2,
      recentComments: 3,
    },
    linkedin: {
      current: 1,
      total: 100,
      status: "published",
      next: 2,
      nextTitle: "AI와 나의 협업 방식",
      nextScheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  });
}

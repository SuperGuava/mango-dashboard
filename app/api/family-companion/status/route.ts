import { NextResponse } from "next/server";

export async function GET() {
  // Mock data for Family Companion pilot
  return NextResponse.json({
    progress: {
      currentWeek: 3,
      totalWeeks: 4,
      percentage: 75,
    },
    todayActivity: {
      questionsUsed: 2,
      questionsTotal: 3,
      responses: [
        { type: "도1", status: "positive", label: "긍정", emoji: "😊" },
        { type: "도0", status: "thinking", label: "고민", emoji: "🤔" },
      ],
    },
    modules: [
      { id: "A", status: "active", label: "활성", icon: "🟢" },
      { id: "B", status: "paused", label: "휴식", icon: "⏸️" },
      { id: "C", status: "waiting", label: "대기", icon: "⏳" },
    ],
    nextScheduled: {
      time: "20:00",
      label: "저녁 질문",
      today: true,
    },
  });
}

import { NextResponse } from "next/server";

// --- Data Types ---

interface KidContent {
  title: string;
  summary: string;
  emoji: string;
  link?: string;
  activity?: string;
}

interface VideoIdea {
  title: string;
  description: string;
  difficulty: "쉬움" | "보통" | "어려움";
}

interface EngagementPrompt {
  question: string;
  context: string;
}

interface GrowthTip {
  category: string;
  tip: string;
}

interface FamilyCompanionData {
  lastUpdated: string;
  do1Content: KidContent;
  do0Content: KidContent;
  videoIdeas: VideoIdea[];
  engagementPrompts: EngagementPrompt[];
  growthTip: GrowthTip;
}

// --- Sample Data (In production, fetch from external sources) ---

const sampleData: FamilyCompanionData = {
  lastUpdated: new Date().toISOString(),
  
  // 도1 (10세) - AI/과학 뉴스
  do1Content: {
    emoji: "🤖",
    title: "오늘의 AI 이슈",
    summary: "OpenAI가 새로운 'o3' 모델을 발표했어요! 이 AI는 퍼즐이나 수학 문제를 푸는 능력이 엄청나게 좋아졌대요. 마치 레벨업한 게임 캐릭터처럼!",
    link: "https://www.youtube.com/results?search_query=o3+ai+model+kids+explained",
    activity: "ChatGPT에게 퀴즈를 내서 맞춰보는 게임을 합시다!",
  },
  
  // 도0 (6세) - 경제/일상
  do0Content: {
    emoji: "💰",
    title: "오늘의 경제 이야기",
    summary: "용돈 100원으로 뭘 살 수 있을까요? 예전에는 사탕 10개를 살 수 있었지만, 지금은 2개밖에 못 산대요. 이게 바로 '물가'라는 거예요.",
    activity: "동전 100원을 들고 마트에 가서 살 수 있는 걸 찾아봐요!",
  },
  
  // D1D0TV 촬영 아이디어
  videoIdeas: [
    {
      title: "아빠가 코인 사면 안 되는 이유",
      description: "도1이 아빠에게 투자의 위험성을 설명하는 코믹 스케치",
      difficulty: "보통",
    },
    {
      title: "6살이 알려주는 저축의 비밀",
      description: "도0이 저금통을 소개하며 용돈 관리 팁 공유",
      difficulty: "쉬움",
    },
    {
      title: "ChatGPT vs 초등학생 퀴즈 대결",
      description: "AI와 두뇌 싸움! 누가 더 똑똑할까?",
      difficulty: "어려움",
    },
  ],
  
  // 시청자 참여 유도
  engagementPrompts: [
    {
      question: "여러분은 용돈 어떻게 쓰나요?",
      context: "댓글로 용돈 사용 계획을 공유해주세요!",
    },
    {
      question: "AI가 알려주는 것 vs 엄마가 알려주는 것",
      context: "댓글 투표: 누구의 말이 더 맞았나요?",
    },
  ],
  
  // 구독자 성장 팁
  growthTip: {
    category: "Shorts 최적화",
    tip: "영상 시작 3초 안에 '오늘은 ~합니다!'로 바로 주제를 말하세요. 시청자 이탈을 막을 수 있어요.",
  },
};

// --- Route Handler ---

export async function GET() {
  // In production, this would:
  // 1. Fetch AI news from an external API (e.g., news API filtered for AI/science)
  // 2. Fetch economy news suitable for kids
  // 3. Analyze D1D0TV channel metrics for personalized tips
  // 4. Cache results and update daily at 7 AM via cron job
  
  // Add timestamp for "freshness" indicator
  const data = {
    ...sampleData,
    lastUpdated: new Date().toISOString(),
  };
  
  return NextResponse.json(data);
}

// POST handler for manual refresh (optional)
export async function POST() {
  // Trigger content refresh manually
  // In production: clear cache, fetch fresh data, etc.
  
  const data = {
    ...sampleData,
    lastUpdated: new Date().toISOString(),
  };
  
  return NextResponse.json({ 
    success: true, 
    message: "Content refreshed",
    data 
  });
}

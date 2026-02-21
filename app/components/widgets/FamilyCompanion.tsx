"use client";

import useSWR from "swr";
import { 
  RefreshCw, 
  Lightbulb, 
  Video, 
  MessageCircle, 
  TrendingUp,
  ExternalLink,
  Sparkles,
  Coins,
  Play
} from "lucide-react";
import Widget from "../Widget";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// --- Types ---

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
  do1Content: KidContent; // 10세 - AI/과학
  do0Content: KidContent; // 6세 - 경제/일상
  videoIdeas: VideoIdea[];
  engagementPrompts: EngagementPrompt[];
  growthTip: GrowthTip;
}

// --- Components ---

function KidCard({ 
  name, 
  age, 
  color, 
  content, 
  icon: Icon 
}: { 
  name: string; 
  age: number; 
  color: string; 
  content: KidContent;
  icon: React.ElementType;
}) {
  return (
    <div className="p-3 bg-gradient-to-br from-[var(--bg-elevated)] to-transparent rounded-xl border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: color }}
        >
          {content.emoji}
        </div>
        <div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{name}</span>
          <span className="text-xs text-[var(--text-secondary)] ml-1">({age}세)</span>
        </div>
        <Icon className="w-4 h-4 text-[var(--text-secondary)] ml-auto" />
      </div>
      
      <h4 className="text-sm font-medium text-[var(--accent-mango)] mb-1">
        {content.title}
      </h4>
      <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-2">
        {content.summary}
      </p>
      
      {content.activity && (
        <div className="p-2 bg-[var(--accent-mango)]/10 rounded-lg mb-2">
          <span className="text-xs font-medium text-[var(--accent-mango)]">활동 제안:</span>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{content.activity}</p>
        </div>
      )}
      
      {content.link && (
        <a 
          href={content.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[var(--accent-blue)] hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          더 알아보기
        </a>
      )}
    </div>
  );
}

function VideoIdeaCard({ idea, index }: { idea: VideoIdea; index: number }) {
  const difficultyColors = {
    "쉬움": "bg-green-500/20 text-green-400",
    "보통": "bg-yellow-500/20 text-yellow-400",
    "어려움": "bg-red-500/20 text-red-400",
  };

  return (
    <div className="flex items-start gap-2 p-2 bg-[var(--bg-elevated)] rounded-lg">
      <div className="w-6 h-6 rounded-full bg-[var(--accent-mango)]/20 flex items-center justify-center text-xs font-bold text-[var(--accent-mango)] flex-shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
            {idea.title}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${difficultyColors[idea.difficulty]}`}>
            {idea.difficulty}
          </span>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">{idea.description}</p>
      </div>
    </div>
  );
}

function EngagementCard({ prompt }: { prompt: EngagementPrompt }) {
  return (
    <div className="p-2 bg-[var(--bg-elevated)] rounded-lg border-l-2 border-[var(--accent-blue)]">
      <p className="text-sm text-[var(--text-primary)] font-medium mb-1">
        &ldquo;{prompt.question}&rdquo;
      </p>
      <p className="text-xs text-[var(--text-secondary)]">{prompt.context}</p>
    </div>
  );
}

// --- Main Component ---

export default function FamilyCompanion() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data, error, mutate } = useSWR<FamilyCompanionData>(
    "/api/family-companion/status",
    fetcher,
    { 
      refreshInterval: 1000 * 60 * 60, // 1시간마다 자동 갱신
      revalidateOnFocus: true,
    }
  );

  const isLoading = !data && !error;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await mutate();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Format last updated time
  const formatLastUpdated = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("ko-KR", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: false 
    });
  };

  return (
    <Widget 
      title="Family Companion" 
      icon="👨‍👩‍👧"
      loading={isLoading}
    >
      <div className="space-y-4">
        {/* Header with refresh */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-mango)]" />
            <span className="text-xs text-[var(--text-secondary)]">
              오늘의 콘텐츠
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
            {data?.lastUpdated ? formatLastUpdated(data.lastUpdated) : "새로고침"}
          </button>
        </div>

        {/* Kids Content Cards */}
        <div className="space-y-3">
          {data?.do1Content && (
            <KidCard
              name="도1"
              age={10}
              color="#60A5FA"
              content={data.do1Content}
              icon={Lightbulb}
            />
          )}
          {data?.do0Content && (
            <KidCard
              name="도0"
              age={6}
              color="#FBBF24"
              content={data.do0Content}
              icon={Coins}
            />
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-subtle)]"></div>

        {/* D1D0TV Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Video className="w-4 h-4 text-[var(--accent-red)]" />
            <h3 className="text-xs font-medium text-[var(--text-secondary)]">
              D1D0TV 활성화
            </h3>
          </div>

          {/* Video Ideas */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Play className="w-3 h-3 text-[var(--text-secondary)]" />
              <span className="text-xs font-medium text-[var(--text-primary)]">
                오늘의 촬영 아이디어
              </span>
            </div>
            <div className="space-y-1.5">
              {data?.videoIdeas?.map((idea, index) => (
                <VideoIdeaCard key={index} idea={idea} index={index} />
              ))}
            </div>
          </div>

          {/* Engagement Prompts */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <MessageCircle className="w-3 h-3 text-[var(--text-secondary)]" />
              <span className="text-xs font-medium text-[var(--text-primary)]">
                시청자 참여 유도
              </span>
            </div>
            <div className="space-y-1.5">
              {data?.engagementPrompts?.map((prompt, index) => (
                <EngagementCard key={index} prompt={prompt} />
              ))}
            </div>
          </div>

          {/* Growth Tip */}
          {data?.growthTip && (
            <div className="p-2.5 bg-gradient-to-r from-[var(--accent-mango)]/10 to-transparent rounded-lg border border-[var(--accent-mango)]/20">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-[var(--accent-mango)]" />
                <span className="text-xs font-medium text-[var(--accent-mango)]">
                  {data.growthTip.category}
                </span>
              </div>
              <p className="text-xs text-[var(--text-primary)]">
                {data.growthTip.tip}
              </p>
            </div>
          )}
        </div>
      </div>
    </Widget>
  );
}

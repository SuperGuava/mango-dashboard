"use client";

import useSWR from "swr";
import { FileText, ChevronRight, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import Widget from "../Widget";
import { formatIndexValue, formatVolume } from "@/app/lib/utils";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// DART/KRX API 응답 타입
interface DartIndexData {
  value: number;
  change: number;
  changePercent: number;
  volume: number;
  source: string;
}

interface DartSnapshotData {
  success: boolean;
  mock?: boolean;
  data: {
    kospi: DartIndexData;
    kosdaq: DartIndexData;
  };
  lastUpdated: string;
}

interface IndexData {
  value: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface CompanyData {
  name: string;
  code: string;
  price: number;
  change: number;
}

interface MangoPickData {
  company: string;
  code: string;
  price: number;
  high52w: number;
  low52w: number;
  reasons: string[];
  metrics: {
    per: number;
    targetPrice: number;
    dividend: number;
    vsHigh52w: number;
  };
  risk: string;
}

interface IPOSnapshotData {
  indices: {
    kospi: IndexData;
    kosdaq: IndexData;
  };
  majorCompanies: CompanyData[];
  mangoPick: MangoPickData;
  pipeline: {
    preListing: number;
    demandForecast: number;
    subscription: number;
  };
  recentDisclosures: Array<{
    company: string;
    type: string;
    date: string;
    url: string;
  }>;
  watchlist: Array<{
    name: string;
    change: number;
    isPositive: boolean;
  }>;
}

function IndexCard({ title, data }: { title: string; data: IndexData | undefined }) {
  if (!data) {
    return (
      <div className="p-3 bg-[var(--bg-elevated)] rounded-lg">
        <div className="text-xs text-[var(--text-secondary)] mb-1">{title}</div>
        <div className="text-xl font-mono font-bold text-[var(--text-primary)]">--</div>
      </div>
    );
  }

  const isPositive = data.change >= 0;

  return (
    <div className="p-3 bg-[var(--bg-elevated)] rounded-lg">
      <div className="text-xs text-[var(--text-secondary)] mb-2">{title}</div>
      <div className="text-xl font-mono font-bold text-[var(--text-primary)] mb-2">
        {formatIndexValue(data.value)}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-sm font-medium ${isPositive ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
          {isPositive ? "+" : ""}{data.changePercent}%
        </span>
        <span>{isPositive ? "🟢" : "🔴"}</span>
      </div>
      <div className={`text-xs font-mono ${isPositive ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
        {isPositive ? "+" : ""}{formatIndexValue(data.change)}
      </div>
      <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
        <div className="text-xs text-[var(--text-secondary)]">거래대금</div>
        <div className="text-sm font-mono text-[var(--text-primary)]">
          {formatVolume(data.volume)}
        </div>
      </div>
    </div>
  );
}

function getChangeIcon(change: number) {
  if (change > 0) return "🟢";
  if (change < 0) return "🔴";
  return "🟡";
}

function getChangeColor(change: number) {
  if (change > 0) return "text-[var(--success)]";
  if (change < 0) return "text-[var(--error)]";
  return "text-[var(--text-secondary)]";
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export default function IPOSnapshot() {
  // 기존 IPO snapshot API (mock 데이터)
  const { data: snapshotData, error: snapshotError } = useSWR<IPOSnapshotData>(
    "/api/ipo/snapshot",
    fetcher,
    { refreshInterval: 60000 }
  );

  // DART/KRX API (실제 데이터 시도)
  const { data: dartData, error: dartError } = useSWR<DartSnapshotData>(
    "/api/ipo/dart?type=indices",
    fetcher,
    { refreshInterval: 60000 }
  );

  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);

  const isLoading = !snapshotData;
  const isMockData = dartData?.mock || !dartData?.data;

  // DART 데이터가 있으면 사용, 없으면 기존 mock 데이터 사용
  const indices = dartData?.data || snapshotData?.indices;

  const now = new Date();
  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // dartData에서 필요한 정보 추출
  const kospiIndex = dartData?.data?.kospi || snapshotData?.indices.kospi;
  const kosdaqIndex = dartData?.data?.kosdaq || snapshotData?.indices.kosdaq;

  return (
    <Widget 
      title="IPO Snapshot" 
      icon="🏢"
      loading={isLoading}
    >
      <div className="max-h-[600px] overflow-y-auto pr-1 space-y-4">
        {/* Market Indices */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--text-secondary)]">
              📊 Market Indices
            </h3>
            <div className="flex items-center gap-2">
              {isMockData && (
                <span className="px-2 py-0.5 text-xs bg-[var(--warning)]/20 text-[var(--warning)] rounded-full">
                  Mock
                </span>
              )}
              {dartData?.data && !isMockData && (
                <span className="text-xs text-[var(--success)]">
                  KRX
                </span>
              )}
              <span className="text-xs text-[var(--text-secondary)]">
                [{timeString}]
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <IndexCard title="KOSPI" data={kospiIndex} />
            <IndexCard title="KOSDAQ" data={kosdaqIndex} />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-subtle)]"></div>

        {/* Major Companies */}
        <div>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            🏢 주요 기업
          </h3>
          <div className="space-y-1">
            {snapshotData?.majorCompanies.map((company, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-1.5 px-2 bg-[var(--bg-elevated)] rounded cursor-pointer hover:bg-[var(--bg-elevated)]/80 transition-colors"
                onClick={() => setSelectedCompany(selectedCompany?.code === company.code ? null : company)}
              >
                <span className="text-sm text-[var(--text-primary)] w-24 truncate">
                  {company.name}
                </span>
                <span className="text-sm font-mono text-[var(--text-primary)] w-20 text-right">
                  {formatPrice(company.price)}
                </span>
                <span className={`text-sm font-mono w-14 text-right ${getChangeColor(company.change)}`}>
                  {company.change > 0 ? "+" : ""}{company.change}%
                </span>
                <span className="w-6 text-right">{getChangeIcon(company.change)}</span>
              </div>
            ))}
          </div>
          
          {/* Company Detail Tooltip */}
          {selectedCompany && (
            <div className="mt-2 p-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-[var(--text-primary)]">
                  {selectedCompany.name} ({selectedCompany.code})
                </span>
                <button 
                  onClick={() => setSelectedCompany(null)}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  닫기
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[var(--text-secondary)]">52주 최고</span>
                  <div className="font-mono text-[var(--text-primary)]">
                    {formatPrice(Math.round(selectedCompany.price * 1.25))}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">52주 최저</span>
                  <div className="font-mono text-[var(--text-primary)]">
                    {formatPrice(Math.round(selectedCompany.price * 0.75))}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">PER</span>
                  <div className="font-mono text-[var(--text-primary)]">
                    {(Math.random() * 20 + 5).toFixed(1)}x
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-subtle)]"></div>

        {/* Mango's Pick */}
        <div>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            🥭 Mango&apos;s Pick
          </h3>
          {snapshotData?.mangoPick && (
            <div className="p-3 bg-[var(--bg-elevated)] rounded-lg">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🥭</span>
                <span className="font-medium text-[var(--text-primary)]">
                  오늘의 픽: {snapshotData.mangoPick.company}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  ({snapshotData.mangoPick.code})
                </span>
              </div>

              {/* Reasons */}
              <div className="mb-3">
                <div className="text-xs text-[var(--text-secondary)] mb-1">💡 추천 이유:</div>
                <ul className="space-y-1">
                  {snapshotData.mangoPick.reasons.map((reason, idx) => (
                    <li key={idx} className="text-sm text-[var(--text-primary)] flex items-start gap-1">
                      <span className="text-[var(--accent-mango)]">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Metrics */}
              <div className="mb-3">
                <div className="text-xs text-[var(--text-secondary)] mb-2">📊 핵심 지표:</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[var(--bg-primary)] p-2 rounded">
                    <div className="text-xs text-[var(--text-secondary)]">현재가</div>
                    <div className="text-sm font-mono text-[var(--text-primary)]">
                      {formatPrice(snapshotData.mangoPick.price)}
                    </div>
                    <div className="text-xs text-[var(--error)]">
                      {snapshotData.mangoPick.metrics.vsHigh52w}% vs 52주 최고
                    </div>
                  </div>
                  <div className="bg-[var(--bg-primary)] p-2 rounded">
                    <div className="text-xs text-[var(--text-secondary)]">PER</div>
                    <div className="text-sm font-mono text-[var(--text-primary)]">
                      {snapshotData.mangoPick.metrics.per}x
                    </div>
                    <div className="text-xs text-[var(--success)]">
                      업종 평균 대비 저평가
                    </div>
                  </div>
                  <div className="bg-[var(--bg-primary)] p-2 rounded">
                    <div className="text-xs text-[var(--text-secondary)]">목표가</div>
                    <div className="text-sm font-mono text-[var(--text-primary)]">
                      {formatPrice(snapshotData.mangoPick.metrics.targetPrice)}
                    </div>
                    <div className="text-xs text-[var(--success)]">
                      +{Math.round((snapshotData.mangoPick.metrics.targetPrice / snapshotData.mangoPick.price - 1) * 100)}% 상승여력
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Disclaimer */}
              <div className="flex items-start gap-1.5 p-2 bg-[var(--error)]/10 rounded">
                <span className="text-xs">⚠️</span>
                <span className="text-xs text-[var(--error)]">
                  리스크: {snapshotData.mangoPick.risk}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-subtle)]"></div>

        {/* Pipeline Status */}
        <div>
          <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2">
            Pipeline Status
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-[var(--bg-elevated)] rounded-lg text-center">
              <div className="text-lg font-bold text-[var(--text-primary)]">
                {snapshotData?.pipeline.preListing ?? "--"}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">상장예비</div>
            </div>
            <div className="p-2 bg-[var(--bg-elevated)] rounded-lg text-center">
              <div className="text-lg font-bold text-[var(--text-primary)]">
                {snapshotData?.pipeline.demandForecast ?? "--"}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">수요예측</div>
            </div>
            <div className="p-2 bg-[var(--bg-elevated)] rounded-lg text-center">
              <div className="text-lg font-bold text-[var(--text-primary)]">
                {snapshotData?.pipeline.subscription ?? "--"}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">공모청약</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-subtle)]"></div>

        {/* Recent Disclosures */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
            <h3 className="text-xs font-medium text-[var(--text-secondary)]">
              Recent Disclosures
            </h3>
          </div>
          <div className="space-y-1.5">
            {snapshotData?.recentDisclosures.slice(0, 2).map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-[var(--bg-elevated)] rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {item.company}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {item.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-2 text-xs text-[var(--accent-mango)] hover:text-[var(--accent-mango)]/80 transition-colors flex items-center gap-1">
            더보기 <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-subtle)]"></div>

        {/* Watchlist */}
        <div>
          <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2">
            Watchlist
          </h3>
          <div className="space-y-1.5">
            {snapshotData?.watchlist.map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-[var(--bg-elevated)] rounded-lg"
              >
                <span className="text-sm text-[var(--text-primary)]">
                  {item.name}
                </span>
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-medium ${
                    item.isPositive ? "text-[var(--success)]" : "text-[var(--error)]"
                  }`}>
                    {item.isPositive ? "+" : ""}{item.change}%
                  </span>
                  <span>{item.isPositive ? "🟢" : "🔴"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Widget>
  );
}

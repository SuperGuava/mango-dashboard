import { ReactNode } from "react";
import { cn } from "../lib/utils";

interface WidgetProps {
  title: string;
  icon?: ReactNode;
  badge?: string;
  children: ReactNode;
  className?: string;
  loading?: boolean;
  mangoPick?: string; // 🥭 망고's Pick 배지 텍스트
}

export default function Widget({ 
  title, 
  icon, 
  badge, 
  children, 
  className,
  loading = false,
  mangoPick
}: WidgetProps) {
  if (loading) {
    return (
      <div className={cn(
        "bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-6 widget-card",
        className
      )}>
        <div className="animate-pulse space-y-4">
          <div className="h-7 bg-[var(--border-subtle)] rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-[var(--border-subtle)] rounded w-full"></div>
            <div className="h-4 bg-[var(--border-subtle)] rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-6 widget-card flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
        </div>
        {badge && (
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-[var(--error)]/20 text-[var(--error)] border border-[var(--error)]/30">
            {badge}
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1">
        {children}
      </div>
      
      {/* 🥭 Mango's Pick 배지 */}
      {mangoPick && (
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">🥭</span>
            <span className="text-[var(--accent-mango)] font-medium">Mango&apos;s Pick:</span>
            <span className="text-[var(--text-secondary)]">{mangoPick}</span>
          </div>
        </div>
      )}
    </div>
  );
}

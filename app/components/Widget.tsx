import { ReactNode } from "react";
import { cn } from "../lib/utils";

interface WidgetProps {
  title: string;
  icon?: ReactNode;
  badge?: string;
  children: ReactNode;
  className?: string;
  loading?: boolean;
}

export default function Widget({ 
  title, 
  icon, 
  badge, 
  children, 
  className,
  loading = false 
}: WidgetProps) {
  if (loading) {
    return (
      <div className={cn(
        "bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-5 widget-card",
        className
      )}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[var(--border-subtle)] rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-[var(--border-subtle)] rounded w-full"></div>
            <div className="h-4 bg-[var(--border-subtle)] rounded w-5/6"></div>
            <div className="h-4 bg-[var(--border-subtle)] rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-5 widget-card",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
        </div>
        {badge && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--error)]/20 text-[var(--error)] border border-[var(--error)]/30">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

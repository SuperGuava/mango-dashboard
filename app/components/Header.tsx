"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, RefreshCw } from "lucide-react";

export default function Header() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="h-16 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] px-4 sm:px-6 lg:px-8">
      <div className="h-full max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">🥭</span>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Mango Dashboard
          </h1>
        </div>
        
        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Last update time */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="font-mono">{currentTime}</span>
          </div>
          
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          
          {/* Theme toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-[var(--text-secondary)]" />
            ) : (
              <Moon className="w-5 h-5 text-[var(--text-secondary)]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

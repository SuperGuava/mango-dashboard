import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '억'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '만'
  }
  return num.toLocaleString()
}

export function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days === 1) return '어제'
  return `${days}일 전`
}

export function formatIndexValue(value: number): string {
  return value.toLocaleString('ko-KR', { minimumFractionDigits: 2 });
}

export function formatVolume(volume: number): string {
  if (volume >= 1e12) return `${(volume / 1e12).toFixed(1)}조`;
  if (volume >= 1e8) return `${(volume / 1e8).toFixed(0)}억`;
  return volume.toLocaleString();
}

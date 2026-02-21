import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Mango Dashboard",
  description: "OpenClaw AI 비서 망고의 운영 상태와 콘텐츠 파이프라인 모니터링",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[var(--bg-primary)] min-h-screen`}>
        {children}
      </body>
    </html>
  );
}

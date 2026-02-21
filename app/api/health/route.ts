import { NextResponse } from "next/server";

export async function GET() {
  // Mock data for OpenClaw Gateway and GPT status
  return NextResponse.json({
    gateway: {
      status: "online",
      lastChecked: new Date().toISOString(),
    },
    gptQuota: {
      status: "limited",
      remaining: 0,
      resetIn: 19200, // 5h 20m in seconds
    },
  });
}

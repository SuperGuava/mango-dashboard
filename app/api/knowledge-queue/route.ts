import { NextResponse } from "next/server";

export async function GET() {
  // Mock data for knowledge queue
  return NextResponse.json({
    obsidian: {
      lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      syncStatus: "needed",
    },
    retention: {
      review: 7,
      discard: 0,
      keep: 19,
    },
    github: {
      openPRs: 1,
      openIssues: 0,
      items: [
        {
          type: "pr",
          number: 3,
          title: "Fix: sync bug",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          url: "https://github.com/ninefire/my-project/pull/3",
        },
      ],
    },
  });
}

"use client";

import { useEffect, useState } from "react";
import { useUsage } from "@/components/providers/usage-provider";
import { StatCard } from "./_components/stat-card";
import { ActivityChart } from "./_components/activity-chart";
import { RoiCards } from "./_components/roi-cards";
import { Bug } from "lucide-react";
import DashboardLoading from "./loading";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

interface DashboardData {
  user: {
    email: string;
    plan: "FREE" | "PRO";
    prsUsed: number;
    prsCreated: number;
    issuesUsed: number;
    chatMessagesUsed: number;
  };
  stats: {
    totalPrs: number;
    totalIssues: number;
    repoCount: number;
    repoName: string;
    githubAccount: string | null;
  };

  chartData: {
    date: string;
    pullRequests: number;
    issues: number;
  }[];

  limits: {
    FREE: {
      prs: number;
      prsCreated: number;
      issues: number;
      chat: number;
    };

    PRO: {
      prs: number;
      prsCreated: number;
      issues: number;
      chat: number;
    };
  };
}

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuthRedirect();
  const { getUsagePercentage } = useUsage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("90d");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("failed to fetch");
        setData(await res.json());
      } catch (error) {
        console.error("dashbord error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (isSignedIn) {
      fetchData();
    }
  }, [isSignedIn]);

  if (!isLoaded || loading) {
    return <DashboardLoading />;
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="border border-white/[0.12] border-dashed rounded-2xl p-8 bg-[#0f0909]">
          <div className="app-kicker">Getting Started</div>
          <h2 className="text-xl font-semibold mb-2 text-white mt-3">No review activity yet</h2>
          <p className="app-subtitle mb-6">
            Connect a GitHub repo and let BugHop run its first review to activate your analytics.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.08] bg-[#0f0909] p-4">
              <p className="text-sm font-medium mb-1 text-white">1. Connect GitHub</p>
              <p className="text-xs text-[#b49a8e]">
                Install the BugHop app and pick a repo.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#0f0909] p-4">
              <p className="text-sm font-medium mb-1 text-white">2. Start indexing</p>
              <p className="text-xs text-[#b49a8e]">
                BugHop builds context across your services.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#0f0909] p-4">
              <p className="text-sm font-medium mb-1 text-white">3. Run a review</p>
              <p className="text-xs text-[#b49a8e]">
                Open a PR or issue to see findings.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <a
              href="/settings"
              className="inline-flex items-center justify-center rounded-xl bg-[#f5efe7] px-5 py-2.5 text-sm font-medium text-[#0a0707] hover:bg-[#e7d6cb] transition-colors"
            >
              Configure BugHop
            </a>
          </div>
        </div>
      </div>
    );
  }

  const filteredChartData = data.chartData.filter((item) => {
    const date = new Date(item.date);
    const now = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    return date >= startDate;
  });

  const normalizedChartData = filteredChartData.map((item) => ({
    ...item,
    pullRequests: Math.max(0, item.pullRequests || 0),
    issues: Math.max(0, item.issues || 0),
  }));

  const limits = data.limits[data.user.plan];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="app-header">
        <div className="app-kicker">BugHop Insights</div>
        <h1 className="app-title text-white mt-3">Dashboard</h1>
        <p className="app-subtitle mt-1">
          Real-time visibility into automated reviews, quality, and velocity.
        </p>
      </div>
      
      {!data.stats.githubAccount && (
        <div className="mb-8 p-6 rounded-2xl border border-[#ef3a2d]/30 bg-[#ef3a2d]/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Bug className="w-32 h-32 text-[#ef3a2d] rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#ef3a2d] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#ef3a2d] rig-mono">Action Required</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Install BugHop GitHub App</h2>
            <p className="text-[#b49a8e] mb-5 max-w-xl">
              To start autonomous code reviews and see real-time insights, you need to install our GitHub app and grant access to your repositories.
            </p>
            <a 
              href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME}/installations/new`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-[#ef3a2d] px-6 py-3 text-sm font-bold text-white hover:bg-[#d63328] transition-all shadow-lg shadow-[#ef3a2d]/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Configure GitHub Access
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          label="PRs Reviewed This Month"
          used={data.user.prsUsed}
          limit={limits.prs}
          percentage={getUsagePercentage("prs")}
        />
        <StatCard
          label="PRs Created This Month"
          used={data.user.prsCreated}
          limit={limits.prsCreated}
          percentage={getUsagePercentage("prsCreated")}
        />
        <StatCard
          label="Issues Analyzed"
          used={data.user.issuesUsed}
          limit={limits.issues}
          percentage={getUsagePercentage("issues")}
        />
        <StatCard
          label="Chat Messages"
          used={data.user.chatMessagesUsed}
          limit={limits.chat}
          percentage={getUsagePercentage("chat")}
        />
        <RoiCards
          totalPRs={data.user.prsUsed + data.user.prsCreated}
          totalIssues={data.user.issuesUsed}
        />
      </div>

      <ActivityChart
        chartData={normalizedChartData}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
    </div>
  );
}

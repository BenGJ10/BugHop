"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useUsage } from "@/components/providers/usage-provider";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { AccountCard } from "./_components/account-card";
import { UsageCard } from "./_components/usage-card";
import { GithubCard } from "./_components/github-card";
import { SystemStatusCard } from "./_components/system-status-card";
import SettingsLoading from "./loading";

type ServiceStatus = {
  status?: string;
  detail?: string;
};

export default function SettingsPage() {
  const { isSignedIn, isLoaded } = useAuthRedirect();
  const { user } = useUser();
  const { usage, loading: usageLoading } = useUsage();
  const [loading, setLoading] = useState(false);
  const [repoName, setRepoName] = useState<string | null>(null);
  const [indexingStatus, setIndexingStatus] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<
    "online" | "offline" | "degraded" | "maintenance"
  >("online");
  const [toast, setToast] = useState<{
    message: string;
    tone: "info" | "success" | "error";
  } | null>(null);
  const lastIndexingStatusRef = useRef<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [uptime, setUptime] = useState<number | null>(null);
  const [services, setServices] = useState<Record<string, ServiceStatus>>({});

  useEffect(() => {
    const showToast = (message: string, tone: "info" | "success" | "error") => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      setToast({ message, tone });
      toastTimerRef.current = setTimeout(() => setToast(null), 4000);
    };

    const handleIndexingStatus = (nextStatus: string | null) => {
      const prevStatus = lastIndexingStatusRef.current;
      lastIndexingStatusRef.current = nextStatus;

      if (!prevStatus || !nextStatus || prevStatus === nextStatus) {
        return;
      }

      if (nextStatus === "INDEXING") {
        showToast("Indexing started", "info");
      } else if (nextStatus === "COMPLETED") {
        showToast("Indexing completed", "success");
      } else if (nextStatus === "FAILED") {
        showToast("Indexing failed", "error");
      }
    };

    const fetchRepo = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          const repo = data.stats?.repoName || null;
          const status = data.stats?.indexingStatus || null;
          setRepoName(repo);
          setIndexingStatus(status);
          handleIndexingStatus(status);
        }
      } catch (error) {
        console.error("error fetchig repo:", error);
      }
    };

    if (!isSignedIn) {
      return;
    }

    fetchRepo();
    const intervalId = setInterval(fetchRepo, 8000);

    return () => {
      clearInterval(intervalId);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, [isSignedIn]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/status");
        const data = await res.json();
        setBackendStatus(data.status || "offline");
        if (data.uptime != null) {
          setUptime(data.uptime);
        }
        if (data.services && typeof data.services === "object") {
          setServices(data.services);
        }
      } catch {
        setBackendStatus("offline");
      }
    };
    fetchStatus();
  }, []);

  if (!isLoaded || usageLoading) {
    return <SettingsLoading />;
  }

  const isPro = usage?.plan === "PRO";
  const currentPlan = usage?.plan || "FREE";

  return (
    <div className="max-w-4xl mx-auto">
      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-sm ${toast.tone === "success"
                ? "border-white/[0.16] bg-white/5 text-[#f5efe7]"
                : toast.tone === "error"
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : "border-white/[0.08] bg-[#120b0b] text-[#e7d6cb]"
              }`}
          >
            {toast.message}
          </div>
        </div>
      )}
      <div className="app-header">
        <div className="app-kicker">Control Center</div>
        <h1 className="app-title text-white mt-3">Settings</h1>
        <p className="app-subtitle mt-1">
          Manage your account, usage, and integration health.
        </p>
      </div>

      <AccountCard
        email={user?.primaryEmailAddress?.emailAddress}
        userId={user?.id}
      />

      <UsageCard
        prsUsed={usage?.prsUsed || 0}
        prsCreated={usage?.prsCreated || 0}
        issuesUsed={usage?.issuesUsed || 0}
        chatMessagesUsed={usage?.chatMessagesUsed || 0}
        limits={{
          prs: usage?.limits[currentPlan].prs || 0,
          prsCreated: usage?.limits[currentPlan].prsCreated || 0,
          issues: usage?.limits[currentPlan].issues || 0,
          chat: usage?.limits[currentPlan].chat || 0
        }
        }
      />

      <GithubCard repoName={repoName} indexingStatus={indexingStatus} />
      <SystemStatusCard
        backendStatus={backendStatus}
        uptime={uptime}
        services={services}
      />
    </div>
  );
}

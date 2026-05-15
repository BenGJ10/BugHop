"use client"
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";

interface UsageLimits {
  prs: number;
  prsCreated: number;
  issues: number;
  chat: number;
}

interface UsageData {
  plan: "FREE" | "PRO";
  prsUsed: number;
  prsCreated: number;
  issuesUsed: number;
  chatMessagesUsed: number;
  billingCycleStart: string;
  githubAccount: string | null;
  repoName: string | null;
  limits: {
    FREE: UsageLimits;
    PRO: UsageLimits;
  };
}

type UsageType = "prs" | "prsCreated" | "issues" | "chat";

interface UsageContextType {
  usage: UsageData | null;
  loading: boolean;
  error: string | null;
  refreshUsage: () => Promise<void>;
  canSendMessage: () => boolean;
  getRemainingMessages: () => number;
  getUsagePercentage: (type: UsageType) => number;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export function UsageProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch usage");
      const data = await res.json();

      const repoName =
        data.stats?.repoName && data.stats.repoName !== "No repository connected"
          ? data.stats.repoName
          : null;

      setUsage({
        plan: data.user.plan,
        prsUsed: data.user.prsUsed,
        prsCreated: data.user.prsCreated,
        issuesUsed: data.user.issuesUsed,
        chatMessagesUsed: data.user.chatMessagesUsed,
        billingCycleStart: data.user.billingCycleStart,
        githubAccount: data.stats?.githubAccount || null,
        repoName,
        limits: data.limits,
      });
      setError(null);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [isSignedIn, isLoaded]);

  const canSendMessage = () => {
    if (!usage) return true;
    const limit = usage.limits[usage.plan].chat;
    return usage.chatMessagesUsed < limit;
  };

  const getRemainingMessages = () => {
    if (!usage) return 0;
    const limit = usage.limits[usage.plan].chat;
    return limit - usage.chatMessagesUsed;
  };

  const getUsagePercentage = (type: UsageType) => {
    if (!usage) return 0;

    let used;
    let limit;

    if (type === "prs") {
      used = usage.prsUsed;
      limit = usage.limits[usage.plan].prs;
    } else if (type === "prsCreated") {
      used = usage.prsCreated;
      limit = usage.limits[usage.plan].prsCreated;
    } else if (type === "issues") {
      used = usage.issuesUsed;
      limit = usage.limits[usage.plan].issues;
    } else {
      used = usage.chatMessagesUsed;
      limit = usage.limits[usage.plan].chat;
    }

    return (used / limit) * 100;
  };

  return (
    <UsageContext.Provider
      value={{
        usage,
        loading,
        error,
        refreshUsage: fetchUsage,
        canSendMessage,
        getRemainingMessages,
        getUsagePercentage,
      }}
    >
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error("useUsage must be used within a UsageProvider");
  }

  return context;
}

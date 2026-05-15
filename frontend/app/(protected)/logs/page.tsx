"use client";

import { useEffect, useState } from "react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { LogFilters } from "./_components/log-filters";
import { LogTable } from "./_components/log-table";
import type { LogEntry } from "./_components/log-table";
import type { Repository } from "./_components/log-filters";

export default function LogsPage() {
  const { isSignedIn, isLoaded } = useAuthRedirect();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | "pr" | "issue">("all");
  const [repoFilter, setRepoFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    const fetchLogs = async () => {
      if (!initialLoading) {
        setFiltering(true);
      }

      try {
        const params = new URLSearchParams();
        if (typeFilter !== "all") {
          params.set("type", typeFilter);
        }
        if (repoFilter !== "all") {
          params.set("repoId", repoFilter);
        }
        if (startDate) {
          params.set("startDate", startDate.toISOString());
        }
        if (endDate) {
          params.set("endDate", endDate.toISOString());
        }

        const res = await fetch(`/api/logs?${params.toString()}`);
        if (!res.ok) throw new Error("fauled to fetch logs");

        const data = await res.json();
        setLogs(data.logs);
        setRepositories(data.repositories || []);
      } catch (error) {
        console.error("error fetchignlogs :", error);
      } finally {
        setInitialLoading(false);
        setFiltering(false);
      }
    };
    fetchLogs();
  }, [isSignedIn, typeFilter, repoFilter, startDate, endDate]);

  const clearFilters = () => {
    setTypeFilter("all");
    setRepoFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  if (!isLoaded || initialLoading) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="app-header">
        <div className="app-kicker">Audit Trail</div>
        <h1 className="app-title text-white mt-3">Activity Logs</h1>
        <p className="app-subtitle mt-1">
          Every PR review and issue analysis BugHop has delivered.
        </p>
      </div>

      <LogFilters
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        repoFilter={repoFilter}
        onRepoFilterChange={setRepoFilter}
        repositories={repositories}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onClearFilters={clearFilters}
      />

      <LogTable
        logs={logs}
        hasActiveFilters={
          typeFilter !== "all" ||
          repoFilter !== "all" ||
          !!startDate ||
          !!endDate
        } 
      />
    </div>
  );
}

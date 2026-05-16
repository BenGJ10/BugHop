"use client";

import { useEffect, useState } from "react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Github } from "lucide-react";
import Link from "next/link";
import RepositoriesLoading from "./loading";

const SCANNING_STEPS = [
  "Cloning repository...",
  "Generating AST...",
  "Vectorizing code chunks...",
  "Finalizing AI Context...",
];

interface Repository {
  id: string;
  name: string;
  fullName: string;
  indexingStatus: "NOT_STARTED" | "INDEXING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

export default function RepositoriesPage() {
  const { isSignedIn, isLoaded } = useAuthRedirect();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchRepos = async () => {
      try {
        const res = await fetch("/api/repositories");
        if (res.ok) {
          const data = await res.json();
          setRepositories(data.repositories);
        }
      } catch (err) {
        console.error("Failed to fetch repositories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [isSignedIn]);

  // Cycle through scanning steps for any indexing repos
  useEffect(() => {
    const hasIndexing = repositories.some(r => r.indexingStatus === "INDEXING");
    if (!hasIndexing) return;

    const interval = setInterval(() => {
      setScanStep((prev) => (prev + 1) % SCANNING_STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [repositories]);

  if (!isLoaded || loading) {
    return <RepositoriesLoading />;
  }

  const renderStatus = (status: Repository["indexingStatus"]) => {
    if (status === "INDEXING") {
      return (
        <div className="flex items-center gap-2 text-[#d6c2b8]">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span
            key={scanStep}
            className="text-xs font-medium animate-pulse transition-all duration-300"
          >
            {SCANNING_STEPS[scanStep]}
          </span>
        </div>
      );
    }

    if (status === "COMPLETED") {
      return (
        <div className="flex items-center gap-1.5 text-[#f5efe7]">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Indexed</span>
        </div>
      );
    }

    if (status === "FAILED") {
      return (
        <div className="flex items-center gap-1.5 text-red-500">
          <XCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Failed</span>
        </div>
      );
    }

    return <span className="text-xs text-[#b49a8e]">Not Indexed</span>;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="app-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="app-kicker">Codebase Access</div>
          <h1 className="app-title text-white mt-3">Repositories</h1>
          <p className="app-subtitle mt-1">
            Connect repos, track indexing, and keep BugHop in sync.
          </p>
        </div>
        <Button className="bg-[#f5efe7] hover:bg-[#e7d6cb] text-[#0a0707] cursor-pointer self-start sm:self-auto" asChild>
          <a
            href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-4 h-4 mr-2" />
            Manage App
          </a>
        </Button>
      </div>

      {repositories.length === 0 ? (
        <Card className="app-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#140c0c] flex items-center justify-center mb-4 border border-white/[0.08]">
              <Github className="w-8 h-8 text-[#b49a8e]" />
            </div>
            <h2 className="text-lg font-semibold mb-2 text-white">No Repositories Found</h2>
            <p className="app-subtitle text-center max-w-md mb-6 text-sm">
              Install the BugHop GitHub App to start indexing and reviewing your repos.
            </p>
            <Button className="bg-[#f5efe7] hover:bg-[#e7d6cb] text-[#0a0707] cursor-pointer" asChild>
              <a
                href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Install GitHub App
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {repositories.map((repo) => (
            <Card key={repo.id} className="flex flex-col app-card hover:border-white/[0.16] transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-mono truncate text-white" title={repo.fullName}>
                  {repo.fullName}
                </CardTitle>
                <CardDescription className="text-[#b49a8e]">
                  Added on {new Date(repo.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="p-3 bg-[#0f0909] rounded-xl border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#d6c2b8]">Status</span>
                    {renderStatus(repo.indexingStatus)}
                  </div>
                  {repo.indexingStatus === "INDEXING" && (
                    <div className="mt-3 w-full h-1.5 bg-[#1b1111] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#f5efe7] rounded-full animate-pulse"
                        style={{
                          width: `${((scanStep + 1) / SCANNING_STEPS.length) * 100}%`,
                          transition: "width 2.3s ease",
                        }}
                      />
                    </div>
                  )}
                  {repo.indexingStatus === "COMPLETED" && (
                    <p className="text-xs text-[#b49a8e] mt-2">
                      BugHop is actively reviewing PRs and issues for this repository.
                    </p>
                  )}
                  {repo.indexingStatus === "FAILED" && (
                    <p className="text-xs text-red-500/80 mt-2">
                      Failed to index. Try re-installing the GitHub App.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

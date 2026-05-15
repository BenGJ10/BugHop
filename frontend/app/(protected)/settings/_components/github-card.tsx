"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const SCANNING_STEPS = [
  "Cloning repository...",
  "Generating AST...",
  "Vectorizing code chunks...",
  "Finalizing AI Context...",
];

interface GithubCardProps {
  repoName: string | null;
  indexingStatus: string | null;
}

export function GithubCard({ repoName, indexingStatus }: GithubCardProps) {
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    if (indexingStatus !== "INDEXING") return;
    const interval = setInterval(() => {
      setScanStep((prev) => (prev + 1) % SCANNING_STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [indexingStatus]);

  const renderStatus = () => {
    if (!indexingStatus) return null;

    if (indexingStatus === "INDEXING") {
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

    if (indexingStatus === "COMPLETED") {
      return (
        <div className="flex items-center gap-1.5 text-[#f5efe7]">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Indexed</span>
        </div>
      );
    }

    if (indexingStatus === "FAILED") {
      return (
        <div className="flex items-center gap-1.5 text-red-500">
          <XCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Failed</span>
        </div>
      );
    }

    return (
      <span className="text-xs text-[#b49a8e]">Not Indexed</span>
    );
  };

  return (
    <Card className="app-card mb-6">
      <CardHeader>
        <CardTitle className="text-white">GitHub Integration</CardTitle>
        <CardDescription className="text-[#b49a8e]">Manage your GitHub App installation</CardDescription>
      </CardHeader>
      <CardContent>
        {repoName ? (
          <div className="mb-4 p-3 bg-[#0f0909] rounded-xl border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#a28d83]">Connected Repository</p>
                <p className="font-medium font-mono text-sm text-[#f5efe7]">{repoName}</p>
              </div>
              {renderStatus()}
            </div>
            {indexingStatus === "INDEXING" && (
              <div className="mt-3 w-full h-1.5 bg-[#1b1111] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f5efe7] rounded-full animate-pulse"
                  style={{ width: `${((scanStep + 1) / SCANNING_STEPS.length) * 100}%`, transition: "width 2.3s ease" }}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-[#b49a8e] mb-4 text-sm">
            No repository connected yet. Install the GitHub App to get started.
          </p>
        )}

        <p className="text-[#b49a8e] text-sm mb-4">
          Click below to manage or install your repositories.
        </p>
        <Button className="bg-[#f5efe7] hover:bg-[#e7d6cb] text-[#0a0707] cursor-pointer" asChild>
          <a
            href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Manage GitHub App
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

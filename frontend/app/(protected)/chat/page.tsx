"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useUsage } from "@/components/providers/usage-provider";
import { MessageBubble } from "./_components/message-bubble";
import { ChatEmptyState } from "./_components/chat-empty-state";
import Link from "next/link";
import { ChevronDown, GitBranch, Layers } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Repo {
  id: string;
  name: string;
  fullName: string;
  indexingStatus: string;
}

const ALL_REPOS_VALUE = "__all__";

const exampleQuestions = [
  "Summarize the riskiest changes in the latest PR.",
  "Which services were affected in the last deployment?",
  "Explain why BugHop flagged this PR as high risk.",
  "What rules are currently applied to reviews?",
];

export default function ChatPage() {
  const { canSendMessage, refreshUsage } = useUsage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);

  // Repo selector state
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>(ALL_REPOS_VALUE);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch repos on mount
  useEffect(() => {
    fetch("/api/repositories")
      .then((r) => r.json())
      .then((data) => {
        if (data.repositories) setRepos(data.repositories);
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-submit when a quick prompt is selected
  useEffect(() => {
    if (pendingSubmit && input.trim()) {
      setPendingSubmit(false);
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSubmit, input]);

  const handleSelectQuestion = (q: string) => {
    setInput(q);
    setPendingSubmit(true);
  };

  const selectedLabel =
    selectedRepo === ALL_REPOS_VALUE
      ? "All Repos"
      : repos.find((r) => r.fullName === selectedRepo)?.name ?? selectedRepo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSendMessage()) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "You have reached your message limit. Upgrade to Pro to keep chatting with your codebase.",
        },
      ]);
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage,
          // null means "all repos"; a specific fullName scopes the search
          repoFullName: selectedRepo === ALL_REPOS_VALUE ? null : selectedRepo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }
      setMessages((prev) => {
        const next = [...prev, { role: "assistant" as const, content: data.answer }];
        setStreamingIndex(next.length - 1);
        return next;
      });
      refreshUsage();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const canChat = canSendMessage();

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] md:h-[calc(100vh-48px)]">
      <div className="app-header max-w-3xl mx-auto px-4 pt-2 w-full">
        <div className="app-kicker">Codebase Chat</div>
        <div className="flex items-center justify-between mt-3 gap-4">
          <h1 className="app-title text-white">BugHop Chat</h1>

          {/* Repo context selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-sm text-[#d6c2b8] cursor-pointer select-none"
            >
              {selectedRepo === ALL_REPOS_VALUE ? (
                <Layers size={14} className="text-[#f5efe7]/60" />
              ) : (
                <GitBranch size={14} className="text-[#f5efe7]/60" />
              )}
              <span className="max-w-[140px] truncate">{selectedLabel}</span>
              <ChevronDown
                size={13}
                className={`text-[#f5efe7]/40 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 min-w-[200px] rounded-xl border border-white/[0.1] bg-[#120b0b] shadow-2xl overflow-hidden">
                {/* All repos option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRepo(ALL_REPOS_VALUE);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${
                    selectedRepo === ALL_REPOS_VALUE
                      ? "bg-white/[0.08] text-[#f5efe7]"
                      : "text-[#d6c2b8] hover:bg-white/[0.05]"
                  }`}
                >
                  <Layers size={14} className="flex-shrink-0 text-[#f5efe7]/50" />
                  <span>All Repos</span>
                  {selectedRepo === ALL_REPOS_VALUE && (
                    <span className="ml-auto text-[10px] text-[#f5efe7]/40 bg-white/[0.08] px-1.5 py-0.5 rounded-full">
                      active
                    </span>
                  )}
                </button>

                {repos.length > 0 && (
                  <div className="border-t border-white/[0.06] pt-1 pb-1">
                    {repos.map((repo) => (
                      <button
                        key={repo.id}
                        type="button"
                        onClick={() => {
                          setSelectedRepo(repo.fullName);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${
                          selectedRepo === repo.fullName
                            ? "bg-white/[0.08] text-[#f5efe7]"
                            : "text-[#d6c2b8] hover:bg-white/[0.05]"
                        }`}
                      >
                        <GitBranch size={14} className="flex-shrink-0 text-[#f5efe7]/50" />
                        <span className="truncate max-w-[160px]">{repo.name}</span>
                        {selectedRepo === repo.fullName && (
                          <span className="ml-auto text-[10px] text-[#f5efe7]/40 bg-white/[0.08] px-1.5 py-0.5 rounded-full">
                            active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="app-subtitle mt-1">
          Ask about review findings, risk, and architecture.{" "}
          <span className="text-[#d6c2b8]/50 text-xs">
            Context:{" "}
            {selectedRepo === ALL_REPOS_VALUE
              ? `all ${repos.length || ""} repos`
              : selectedLabel}
          </span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4 h-full">
          {messages.length === 0 ? (
            <ChatEmptyState
              exampleQuestions={exampleQuestions}
              onSelectQuestion={handleSelectQuestion}
            />
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message}
                isStreaming={index === streamingIndex}
                onComplete={() => setStreamingIndex(null)}
              />
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#120b0b] border border-white/[0.08] rounded-2xl px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-[#f5efe7] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-[#f5efe7] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-[#f5efe7] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-white/[0.08]">
        <div className="max-w-3xl mx-auto">
          {!canChat ? (
            <div className="bg-[#120b0b] border border-white/[0.08] rounded-2xl p-4 text-center">
              <p className="text-[#d6c2b8] mb-2 text-sm">
                You reached your message limit
              </p>
              <Link href="/settings">
                <Button className="bg-[#f5efe7] hover:bg-[#e7d6cb] text-[#0a0707] cursor-pointer">Upgrade to Pro</Button>
              </Link>
            </div>
          ) : (
            <PlaceholdersAndVanishInput
              placeholders={exampleQuestions}
              onChange={(e) => setInput(e.target.value)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useUsage } from "@/components/providers/usage-provider";
import { MessageBubble } from "./_components/message-bubble";
import { ChatEmptyState } from "./_components/chat-empty-state";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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
        body: JSON.stringify({ question: userMessage }),
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
      <div className="app-header max-w-3xl mx-auto px-4 pt-2">
        <div className="app-kicker">Codebase Chat</div>
        <h1 className="app-title text-white mt-3">BugHop Chat</h1>
        <p className="app-subtitle mt-1">Ask about review findings, risk, and architecture.</p>
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

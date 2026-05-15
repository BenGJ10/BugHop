"use client";

import { Bot, Shield, GitBranch, MessageSquareCode, Zap } from "lucide-react";

interface Prompt {
  icon: React.ReactNode;
  title: string;
  description: string;
  question: string;
}

const SUGGESTED_PROMPTS: Prompt[] = [
  {
    icon: <GitBranch className="w-5 h-5 text-[#f5efe7]" />,
    title: "PR Summary",
    description: "Summarize the latest PR",
    question: "Summarize the riskiest changes in the latest PR and why they matter.",
  },
  {
    icon: <Shield className="w-5 h-5 text-[#d6c2b8]" />,
    title: "Security Risk",
    description: "Surface critical issues",
    question: "Identify any critical security risks in the most recent changes and suggest fixes.",
  },
  {
    icon: <MessageSquareCode className="w-5 h-5 text-[#d6c2b8]" />,
    title: "Review Rules",
    description: "Show active review rules",
    question: "List the active review rules BugHop is applying and highlight any conflicts.",
  },
  {
    icon: <Zap className="w-5 h-5 text-[#f5efe7]" />,
    title: "Impact Map",
    description: "See affected modules",
    question: "Which services and modules were impacted by the latest changes?",
  },
];

interface ChatEmptyStateProps {
  exampleQuestions: string[];
  onSelectQuestion: (q: string) => void;
}

export function ChatEmptyState({ onSelectQuestion }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 py-8">
      <div className="text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/[0.16] mx-auto mb-4">
          <Bot className="w-7 h-7 text-[#f5efe7]" />
        </div>
        <h2 className="text-2xl font-semibold mb-1 text-white">Ask BugHop anything</h2>
        <p className="text-[#b49a8e] text-sm max-w-xs mx-auto">
          BugHop has indexed your repo and can answer questions about reviews, risk, and architecture.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt.title}
            onClick={() => onSelectQuestion(prompt.question)}
            className="text-left p-4 rounded-2xl border border-white/[0.08] bg-[#0f0909] hover:bg-[#1b1111] hover:border-white/[0.18] hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1.5">
              {prompt.icon}
              <span className="text-sm font-semibold text-white">{prompt.title}</span>
            </div>
            <p className="text-xs text-[#b49a8e] leading-relaxed">{prompt.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

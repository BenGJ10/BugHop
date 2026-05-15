"use client";

import { Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RULE_PACKS = [
  {
    id: "nextjs",
    emoji: "⚡",
    title: "Next.js Strict",
    description: "App Router, Server Components, and performance best practices",
    rules: `Always use the Next.js App Router pattern. Prefer React Server Components (RSC) over client components unless interactivity is required. Use the "use client" directive sparingly. Always use next/image for images and next/link for navigation. Never use useEffect for data fetching; use server components or React Query instead. API routes must use Next.js Route Handlers (app/api/**/route.ts).`,
  },
  {
    id: "owasp",
    emoji: "🛡️",
    title: "OWASP Security",
    description: "Security-first guidelines based on OWASP Top 10",
    rules: `Enforce OWASP Top 10 security practices. Always validate and sanitize user input on the server side. Never expose sensitive data (API keys, secrets) in client-side code. Use parameterized queries to prevent SQL injection. Implement proper authentication and authorization checks on every API route. Enforce HTTPS and set secure HTTP headers. Never trust user-provided data without validation.`,
  },
  {
    id: "typescript",
    emoji: "🔷",
    title: "TypeScript Strict",
    description: "Strict typing with no any, proper generics and interfaces",
    rules: `Enforce strict TypeScript rules. Never use "any" type — use "unknown" if the type is truly unknown, then narrow it. All functions must have explicit return types. Use interfaces for object types and type aliases for unions/intersections. Generic types should be named descriptively (not just T). Always use const assertions for literals. Avoid type assertions (as Type) unless absolutely necessary.`,
  },
  {
    id: "cleancode",
    emoji: "✨",
    title: "Clean Code",
    description: "Uncle Bob's Clean Code principles for readable, maintainable code",
    rules: `Apply Clean Code principles. Functions should do one thing only and be named with verbs (getUser, createPost). Variables should be named with clear, intention-revealing names. Avoid magic numbers — use named constants. Functions should not have more than 3 parameters. Avoid deep nesting (max 2 levels) — extract logic into functions. Write self-documenting code; comments should explain "why", not "what".`,
  },
];

export const TONE_PREFIXES: Record<string, string> = {
  mentor: "Act as a helpful, encouraging mentor. Provide constructive feedback with clear explanations, suggest improvements gently, and celebrate good patterns you observe. Use a warm and educational tone.",
  strict: "Be strict, concise, and direct. Only flag real issues. Do not pad responses. No pleasantries — just findings and recommendations.",
  emoji: "Use a friendly, casual tone with emojis throughout your responses. Make technical feedback feel approachable and fun. 🚀 Use emojis to highlight key points, warnings ⚠️, and successes ✅.",
};

interface RuleStarterPacksProps {
  onAppendRules: (rules: string) => void;
  tone: string;
  onToneChange: (tone: string) => void;
}

export function RuleStarterPacks({ onAppendRules, tone, onToneChange }: RuleStarterPacksProps) {
  return (
    <div className="mb-6 space-y-4">
      {/* Tone Selector */}
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.08] bg-[#0f0909]">
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">AI Reviewer Tone</p>
          <p className="text-xs text-[#b49a8e]">Controls how BugHop communicates its findings</p>
        </div>
        <Select value={tone} onValueChange={onToneChange}>
          <SelectTrigger className="w-52 bg-[#120b0b] border-white/[0.08] text-[#f5efe7]">
            <SelectValue placeholder="Select tone..." />
          </SelectTrigger>
          <SelectContent className="bg-[#120b0b] border-white/[0.08]">
            <SelectItem value="mentor">🎓 Helpful &amp; Mentor</SelectItem>
            <SelectItem value="strict">⚡ Strict &amp; Concise</SelectItem>
            <SelectItem value="emoji">🎉 Emoji Heavy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Starter Packs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-[#d6c2b8]" />
          <p className="text-sm font-semibold text-white">Rule Starter Packs</p>
          <span className="text-xs text-[#b49a8e]">— click to append to your rules</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {RULE_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => onAppendRules(pack.rules)}
              className="text-left p-3 rounded-2xl border border-white/[0.08] bg-[#0f0909] hover:bg-[#1b1111] hover:border-white/[0.18] hover:scale-[1.01] transition-all duration-200 cursor-pointer"
            >
              <div className="text-xl mb-1">{pack.emoji}</div>
              <p className="text-sm font-semibold text-white">{pack.title}</p>
              <p className="text-xs text-[#b49a8e] mt-0.5 leading-snug">{pack.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

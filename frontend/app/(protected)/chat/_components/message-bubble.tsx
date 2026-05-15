"use client";

import { useEffect, useState, useRef } from "react";

interface MessageBubbleProps {
  message: {
    role: "user" | "assistant";
    content: string;
  };
  isStreaming?: boolean;
  onComplete?: () => void;
}

// ── Inline markdown parser ──────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode[] {
  // Matches **bold**, *italic*, `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-[#f5efe7]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} className="italic text-[#e0d0c8]">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="bg-[#1f1010] border border-white/10 rounded px-1 py-0.5 text-[0.8em] text-[#ef3a2d] font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function MarkdownContent({ content }: { content: string }) {
  // Split on double newlines for block-level elements
  const rawBlocks = content.split(/\n{2,}/);

  return (
    <div className="space-y-2.5">
      {rawBlocks.map((block, bi) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Numbered list block
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split(/\n(?=\d+\.\s)/);
          return (
            <ol key={bi} className="list-decimal list-outside ml-4 space-y-1">
              {items.map((item, ii) => (
                <li key={ii} className="pl-1">
                  {renderInline(item.replace(/^\d+\.\s+/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        // Bullet list block
        if (/^[-*]\s/.test(trimmed)) {
          const items = trimmed.split(/\n(?=[-*]\s)/);
          return (
            <ul key={bi} className="list-disc list-outside ml-4 space-y-1">
              {items.map((item, ii) => (
                <li key={ii} className="pl-1">
                  {renderInline(item.replace(/^[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        // Paragraph — may have single \n line breaks inside
        const lines = trimmed.split("\n");
        return (
          <p key={bi} className="leading-relaxed">
            {lines.map((line, li) => (
              <span key={li}>
                {li > 0 && <br />}
                {renderInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

// ── Streaming word-by-word effect ───────────────────────────────────────────
const WORD_DELAY_MS = 28; // ~35 words/sec, close to ChatGPT feel

export function MessageBubble({ message, isStreaming, onComplete }: MessageBubbleProps) {
  const [displayed, setDisplayed] = useState(
    isStreaming ? "" : message.content
  );
  const calledComplete = useRef(false);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayed(message.content);
      return;
    }

    // Split by words but keep spaces so the text rebuilds naturally
    const tokens = message.content.split(/(\s+)/);
    let idx = 0;
    calledComplete.current = false;

    const tick = setInterval(() => {
      if (idx < tokens.length) {
        const chunk = tokens[idx];
        setDisplayed((prev) => prev + chunk);
        idx++;
      } else {
        clearInterval(tick);
        if (!calledComplete.current) {
          calledComplete.current = true;
          onComplete?.();
        }
      }
    }, WORD_DELAY_MS);

    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.content, isStreaming]);

  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full border border-[#ef3a2d]/40 bg-[#1a0c0c] flex items-center justify-center text-[0.55rem] font-bold text-[#ef3a2d] mr-2 mt-0.5 flex-shrink-0 font-mono tracking-widest">
          BH
        </div>
      )}

      <div
        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-[#1a0c0c] border border-[#ef3a2d]/25 text-[#f5efe7] rounded-sm"
            : "bg-[#120b0b] border border-white/[0.08] text-[#f5efe7] rounded-sm"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{displayed}</p>
        ) : (
          <>
            <MarkdownContent content={displayed} />
            {isStreaming && displayed !== message.content && (
              <span className="inline-block w-0.5 h-3.5 bg-[#ef3a2d] ml-0.5 animate-pulse align-middle" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

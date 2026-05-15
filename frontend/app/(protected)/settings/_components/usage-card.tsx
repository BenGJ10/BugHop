"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UsageCardProps {
  prsUsed: number;
  prsCreated: number;
  issuesUsed: number;
  chatMessagesUsed: number;
  limits: {
    prs: number;
    prsCreated: number;
    issues: number;
    chat: number;
  };
}

function Progressbar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm text-[#f5efe7]">{label}</span>
        <span className="text-sm text-[#a28d83]">
          {used}/{limit}
        </span>
      </div>
      <div className="w-full bg-[#1b1111] rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-[#f5efe7] h-1.5 rounded-full transition-all duration-700"
          style={{
            width: `${(used / (limit || 1)) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

export function UsageCard({
  prsUsed,
  prsCreated,
  issuesUsed,
  chatMessagesUsed,
  limits,
}: UsageCardProps) {
  return (
    <Card className="app-card mb-6">
      <CardHeader>
        <CardTitle className="text-white">Usage this month</CardTitle>
        <CardDescription className="text-[#b49a8e]">
          Your usage resets months from the signup date
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progressbar label="PR Reviews" used={prsUsed} limit={limits.prs} />
          <Progressbar
            label="PRs Created"
            used={prsCreated}
            limit={limits.prsCreated}
          />
          <Progressbar
            label="Issue Analyses"
            used={issuesUsed}
            limit={limits.issues}
          />
          <Progressbar
            label="Chat Messages"
            used={chatMessagesUsed}
            limit={limits.chat}
          />
        </div>
      </CardContent>
    </Card>
  );
}

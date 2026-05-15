"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatCardProps {
  label: string;
  used: number;
  limit: number;
  percentage: number;
}

export function StatCard({ label, used, limit, percentage }: StatCardProps) {
  const isHigh = percentage >= 80;
  return (
    <Card className="app-card">
      <CardHeader className="pb-2">
        <CardDescription className="text-[#b49a8e] text-xs">{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold">
          <span className="text-[#ef3a2d]">{used}</span>
          <span className="text-[#a28d83] text-sm font-normal">/{limit}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-1.5 bg-[#1b1111] rounded-full overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all duration-700"
            style={{
              width: `${percentage}%`,
              background: isHigh
                ? "linear-gradient(90deg, #ef3a2d, #c4211a)"
                : "linear-gradient(90deg, #ef3a2d99, #ef3a2d)",
              boxShadow: percentage > 0 ? "0 0 8px rgba(239,58,45,0.4)" : "none",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ShieldCheck } from "lucide-react";

interface RoiCardsProps {
  totalPRs: number;
  totalIssues: number;
}

function CircularProgress({ value }: { value: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width="72" height="72" className="-rotate-90">
      <circle
        cx="36" cy="36" r={radius}
        strokeWidth="6"
        className="fill-none"
        stroke="#1b1111"
      />
      <circle
        cx="36" cy="36" r={radius}
        strokeWidth="6"
        fill="none"
        stroke="#ef3a2d"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="butt"
        style={{ transition: "stroke-dashoffset 0.8s ease", filter: "drop-shadow(0 0 6px rgba(239,58,45,0.5))" }}
      />
    </svg>
  );
}

export function RoiCards({ totalPRs, totalIssues }: RoiCardsProps) {
  const hoursSaved = totalPRs * 2;
  const healthScore = Math.min(99, Math.max(75, 100 - totalIssues * 2));

  return (
    <>
      {/* Hours Saved */}
      <Card className="app-card">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1.5 text-[#b49a8e] text-xs">
            <Clock className="w-3.5 h-3.5 text-[#ef3a2d]" />
            Est. Hours Saved
          </CardDescription>
          <CardTitle className="text-2xl font-semibold">
            <span className="text-[#ef3a2d]">{hoursSaved}</span>
            <span className="text-sm font-normal text-[#a28d83] ml-1">hrs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-[#a28d83]">Based on ~2 hrs saved per automated review</p>
        </CardContent>
      </Card>

      {/* Health Score */}
      <Card className="app-card">
        <CardHeader className="pb-1">
          <CardDescription className="flex items-center gap-1.5 text-[#b49a8e] text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ef3a2d]" />
            Codebase Health
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-1 pb-2 px-4">
          <div className="relative flex items-center justify-center flex-shrink-0">
            <CircularProgress value={healthScore} />
            <span className="absolute text-sm font-bold text-white">{healthScore}</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <p className="font-semibold text-[#f5efe7] text-right">
              {healthScore >= 90 ? "Excellent" : healthScore >= 80 ? "Good" : "Fair"}
            </p>
            <p className="text-xs text-[#a28d83] text-right">Health score<br />out of 100</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}


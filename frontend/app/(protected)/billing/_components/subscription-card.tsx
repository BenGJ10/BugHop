"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FREE_FEATURES = [
  "50 PR reviews per month",
  "15 Auto-PR creations",
  "50 Issues analyzed",
  "200 chat messages",
  "Custom review rules",
  "GitHub App integration",
];

const PRO_FEATURES = [
  "150 PR reviews per month",
  "50 Auto-PR creations",
  "200 Issues analyzed",
  "1,000 chat messages",
  "Priority support",
  "Everything in Free",
];

interface SubscriptionCardProps {
  isPro: boolean;
  onUpgrade: () => void;
  onManageSubscription: () => void;
  loading: boolean;
}

export function SubscriptionCard({ isPro }: SubscriptionCardProps) {
  return (
    <Card className="app-card mb-6">
      <CardHeader>
        <CardTitle className="text-white">Plan &amp; Billing</CardTitle>
        <CardDescription className="text-[#b49a8e]">Your current plan and available tiers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* FREE TIER */}
          <div
            className={`relative rounded-2xl border-2 p-5 transition-all ${!isPro ? "border-white/[0.18] bg-[#141010]" : "border-white/[0.08] bg-[#0f0909]"
              }`}
          >
            {!isPro && (
              <Badge className="absolute -top-2.5 left-4 bg-[#f5efe7] text-[#0a0707] text-xs px-2 py-0.5">
                Current Plan
              </Badge>
            )}
            <div className="mb-3">
              <p className="text-base font-bold text-white">Free</p>
              <p className="text-2xl font-extrabold mt-0.5 text-white">
                $0<span className="text-sm font-normal text-[#b49a8e]">/mo</span>
              </p>
            </div>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#d6c2b8]">
                  <CheckCircle className="w-4 h-4 text-[#f5efe7] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* PRO TIER */}
          <div className="relative rounded-2xl border-2 border-white/[0.08] bg-[#0f0909] p-5 opacity-80">
            <Badge className="absolute -top-2.5 left-4 bg-[#1b1111] text-[#e7d6cb] text-xs px-2 py-0.5 border border-white/[0.12]">
              Coming Soon
            </Badge>
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-white">Pro</p>
                <Zap className="w-4 h-4 text-[#d6c2b8]" />
              </div>
              <p className="text-2xl font-extrabold mt-0.5 text-[#b49a8e]">
                $—<span className="text-sm font-normal">/mo</span>
              </p>
            </div>
            <ul className="space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#c9b7aa]">
                  <CheckCircle className="w-4 h-4 text-[#d6c2b8] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl bg-[#1b1111] border border-white/[0.12] px-3 py-2">
              <p className="text-xs text-[#e7d6cb] font-medium">
                🚀 Paid billing is coming soon. We&apos;ll notify you when it launches!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

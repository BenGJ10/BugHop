"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RuleFormProps {
  newRule: string;
  onNewRuleChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  creating: boolean;
  canAddMore: boolean;
  rulesCount: number;
  maxRules: number;
  isFree: boolean;
  error: string | null;
}

export function RuleForm({
  newRule,
  onNewRuleChange,
  onSubmit,
  creating,
  canAddMore,
  rulesCount,
  maxRules,
  isFree,
  error,
}: RuleFormProps) {
  return (
    <Card className="app-card mb-6">
      <CardHeader>
        <CardTitle className="text-white">Add New Rule</CardTitle>
        <CardDescription className="text-[#b49a8e]">Write your rule in natural language.</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            value={newRule}
            onChange={(e) => onNewRuleChange(e.target.value)}
            placeholder="e.g. Always use TypeScript strict mode"
            disabled={creating || !canAddMore}
            className="bg-[#120b0b] border-white/[0.08] text-[#f5efe7] placeholder:text-[#8d7468] focus:border-white/[0.3]"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#b49a8e]">
              {rulesCount}/{maxRules} used
              {isFree && rulesCount >= 5 && (
                <span className="ml-2 text-[#f5efe7]">
                  Upgrade to Pro for more rules
                </span>
              )}
            </span>

            <Button
              type="submit"
              disabled={creating || !canAddMore}
              className="bg-[#f5efe7] hover:bg-[#e7d6cb] text-[#0a0707] cursor-pointer"
            >
              {creating ? "Adding..." : "Add Rule"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

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

export interface Rule {
  id: string;
  content: string;
  createdAt: string;
}

interface RuleListProps {
  rules: Rule[];
  editingId: string | null;
  editContent: string;
  onEditContentChange: (value: string) => void;
  onStartEditing: (rule: Rule) => void;
  onCancelEditing: () => void;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RuleList({
  rules,
  editingId,
  editContent,
  onEditContentChange,
  onStartEditing,
  onCancelEditing,
  onUpdate,
  onDelete,
}: RuleListProps) {
  return (
    <Card className="app-card">
      <CardHeader>
        <CardTitle className="text-white">Your Rules</CardTitle>
        <CardDescription className="text-[#b49a8e]">
          These rules will be applied to all Reviews
        </CardDescription>
      </CardHeader>

      <CardContent>
        {rules.length === 0 ? (
          <div className="text-center py-8 text-[#b49a8e]">
            <p className="mb-2">No rules defined yet</p>
            <p className="text-sm text-[#a28d83]">Add your first rule above to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-start gap-3 p-4 border border-white/[0.08] rounded-xl bg-[#0f0909]"
              >
                {editingId === rule.id ? (
                  <div className="flex-1 space-y-2">
                    <Input
                      value={editContent}
                      onChange={(e) => onEditContentChange(e.target.value)}
                      autoFocus
                      className="bg-[#120b0b] border-white/[0.08] text-[#f5efe7]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onUpdate(rule.id)}
                        disabled={!editContent.trim()}
                        className="bg-[#f5efe7] hover:bg-[#e7d6cb] text-[#0a0707] cursor-pointer"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onCancelEditing}
                        className="border-white/[0.08] text-[#d6c2b8] hover:bg-[#1b1111] cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="text-[#f5efe7] text-sm">{rule.content}</p>
                      <p className="text-xs text-[#a28d83] mt-1">
                        Added
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStartEditing(rule)}
                        className="border-white/[0.08] text-[#d6c2b8] hover:bg-[#1b1111] cursor-pointer"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

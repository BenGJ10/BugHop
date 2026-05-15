"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AccountCardProps {
  email: string | undefined;
  userId: string | undefined;
}

export function AccountCard({ email, userId }: AccountCardProps) {
  return (
    <Card className="app-card mb-6">
      <CardHeader>
        <CardTitle className="text-white">Account</CardTitle>
        <CardDescription className="text-[#b49a8e]">Your account information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#a28d83]">Email</label>
            <p className="font-medium text-[#f5efe7] text-sm">{email}</p>
          </div>

          <div>
            <label className="text-xs text-[#a28d83]">User ID</label>
            <p className="font-mono text-sm text-[#d6c2b8]">{userId}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

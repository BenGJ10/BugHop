"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bug, Crown, LogOut, Github, CreditCard } from "lucide-react";
import {
  DashboardIcon,
  ChatIcon,
  LogsIcon,
  RulesIcon,
  SettingsIcon,
} from "@/components/icons/sidebar-icons";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsage } from "@/components/providers/usage-provider";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: DashboardIcon },
  { title: "Repositories", url: "/repositories", icon: Github },
  { title: "Chat", url: "/chat", icon: ChatIcon },
  { title: "Logs", url: "/logs", icon: LogsIcon },
  { title: "Rules", url: "/rules", icon: RulesIcon },
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { usage, loading: usageLoading } = useUsage();
  const [showSignOut, setShowSignOut] = useState(false);

  const isPro = usage?.plan === "PRO";
  const connectionLabel = usage?.githubAccount || usage?.repoName;

  return (
    <aside className="w-64 h-screen sticky top-0 border-r border-white/[0.08] bg-[#0d0707] flex flex-col">
      {/* Logo area */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-md border border-white/[0.12] bg-[#120b0b] flex items-center justify-center shrink-0">
            <Bug className="w-4 h-4 text-[#f5efe7]" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm">BugHop</p>
            <p className="text-xs text-[#a28d83]">Autonomous reviews</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.url;
            return (
              <li key={item.title}>
                <Link
                  href={item.url}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive
                      ? "bg-[#f5efe7]/10 text-[#f5efe7] font-medium border border-white/[0.12]"
                      : "text-[#b49a8e] hover:text-white hover:bg-[#1b1111]"
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-white/[0.08] space-y-4">
        {usageLoading || !user ? (
          <>
            <div className="px-2 space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-[#1b1111] rounded animate-pulse" />
                <div className="h-4 w-12 bg-[#1b1111] rounded animate-pulse" />
              </div>
              <div className="h-2 w-full bg-[#1b1111] rounded-full animate-pulse" />
            </div>

            <div className="px-2 space-y-2">
              <div className="h-4 w-20 bg-[#1b1111] rounded animate-pulse" />
              <div className="h-8 w-full bg-[#1b1111] rounded animate-pulse" />
            </div>

            <div className="px-2 flex justify-between items-center">
              <div className="h-4 w-24 bg-[#1b1111] rounded animate-pulse" />
              <div className="h-5 w-10 bg-[#1b1111] rounded-full animate-pulse" />
            </div>

            <div className="px-2">
              <div className="p-2 gap-2 flex items-center">
                <div className="h-6 w-6 bg-[#1b1111] rounded-full animate-pulse" />
                <div className="h-4 flex-1 bg-[#1b1111] rounded animate-pulse" />
              </div>
            </div>
          </>
        ) : (
          <>
            {usage && (
              <div className="px-2">
                <div className="flex items-center gap-2 text-xs text-[#a28d83] mb-2">
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Connection</span>
                </div>
                <div className="rounded-lg border border-white/[0.08] bg-[#0f0909] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${connectionLabel ? "bg-[#f5efe7]" : "bg-[#3b3330]"}`}
                    />
                    <span className="text-xs text-[#f5efe7]">
                      {connectionLabel ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#a28d83] mt-1 truncate">
                    {connectionLabel || "Connect a repo from Settings"}
                  </p>
                </div>
              </div>
            )}

            {usage && (
              <div className="px-2">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[#a28d83] text-xs">Chat Messages</span>
                  <span className="font-medium text-[#e0d2c8] text-xs">
                    {usage.chatMessagesUsed} / {usage.limits[usage.plan].chat}
                  </span>
                </div>

                <div className="w-full h-1.5 bg-[#1b1111] rounded-full overflow-hidden">
                  <div
                    className="h-1.5 bg-[#f5efe7] rounded-full transition-all"
                    style={{
                      width: `${(usage.chatMessagesUsed / usage.limits[usage.plan].chat) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="px-2">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-[#e7d6cb]" />
                <span className="text-sm font-medium text-[#f5efe7]">
                  {isPro ? "Pro Plan" : "Free Plan"}
                </span>
              </div>
              <Link href="/billing">
                <Button className="w-full bg-[#f5efe7] hover:bg-[#e7d6cb] text-[#0a0707] text-xs h-8 rounded-lg font-medium cursor-pointer">
                  {isPro ? "Manage Subscription" : "Upgrade to Pro"}
                </Button>
              </Link>

              <div className="relative mt-3">
                <button
                  onClick={() => setShowSignOut(!showSignOut)}
                  className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-[#1b1111] transition-colors cursor-pointer"
                >
                  {user?.imageUrl && (
                    <img
                      src={user.imageUrl}
                      alt="users profile image"
                      className="w-6 h-6 rounded-full ring-1 ring-white/[0.06]"
                    />
                  )}

                  <span className="text-xs truncate flex-1 text-left text-[#b49a8e]">
                    {user?.primaryEmailAddress?.emailAddress}
                  </span>
                </button>

                {showSignOut && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#120b0b] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50">
                    <button
                      onClick={() => signOut({ redirectUrl: "/" })}
                      className="flex items-center gap-2 w-full p-3 hover:bg-[#1b1111] transition-colors text-sm font-medium text-[#f5efe7] cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

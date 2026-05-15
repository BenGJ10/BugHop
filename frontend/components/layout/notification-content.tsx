"use client";

import {
  Bell,
  GitPullRequest,
  MessageSquare,
  Database,
  X,
  Check,
} from "lucide-react";
import {
  useInboxNotifications,
  useUnreadInboxNotificationsCount,
  useMarkAllInboxNotificationsAsRead,
} from "@liveblocks/react/suspense";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export function NotificationContent() {
  const { inboxNotifications } = useInboxNotifications();
  const { count } = useUnreadInboxNotificationsCount();
  const markAllAsRead = useMarkAllInboxNotificationsAsRead();

  if (inboxNotifications.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No notifications yet</p>
      </div>
    );
  }

  // {
  //     id: "notif_xyz",
  //     kind: "$prReviewed",
  //     activities: [
  //       {
  //         data: {
  //           prNumber: 42,
  //           repoName: "gowrizz/myapp",
  //           title: "Fix login bug",
  //           url: "https://github.com/gowrizz/myapp/pull/42"
  //         }
  //       }
  //     ]
  //   }

  const getNotificationContent = (
    notification: (typeof inboxNotifications)[0],
  ) => {
    const kind = notification.kind;
    const activity = notification.activites.data;
    const url = activity.url;

    switch (kind) {
      case "$prReviewed":
        return {
          icon: <GitPullRequest className="w-4 h-4 text-[#127A4D]" />,
          iconBg: "bg-[#127A4D]/10",
          title: "PR Reviewed",
          description: `PR #${activity.prNumber} in ${activity.repoName}`,
          url,
        };
      case "$issueAnalyzed":
        return {
          icon: <MessageSquare className="w-4 h-4 text-[#127A4D]" />,
          iconBg: "bg-[#127A4D]/10",
          title: "Issue Analyzed",
          description: `Issue #${activity.issueNumber} in ${activity.repoName}`,
          url,
        };
      case "$prCreated":
        return {
          icon: <GitPullRequest className="w-4 h-4 text-[#127A4D]" />,
          iconBg: "bg-[#127A4D]/10",
          title: "Auto-PR Created",
          description: `PR #${activity.prNumber} in ${activity.repoName}`,
          url,
        };
      case "$indexingComplete":
        const isCompleted = activity.status === "completed";

        return {
          icon: isCompleted ? (
            <Database className="w-4 h-4 text-[#127A4D]" />
          ) : (
            <X className="w-4 h-4 text-[#127A4D]" />
          ),
          iconBg: isCompleted ? "bg-[#127A4D]/10" : "bg-red-500/10",
          title: isCompleted ? "Indexing Completed idiot" : "Indexing failed",
          description: `${activity.repoName}`,
          url,
        };

      default:
        return {
          icon: <Bell className="w-4 h-4 text-muted-foreground" />,
          iconBg: "bg-muted",
          title: "Notification",
          description: "New Notification",
          url: undefined,
        };
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-sm font-medium">Notifications</span>
        {count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className={"text-xs h-6 px-2 cursor-pointer"}
          >
            <Check className="w-3 h-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto">
        {inboxNotifications.map((notification) => {
          const content = getNotificationContent(notification);
          const timeAgo = formatDistanceToNow(
            new Date(notification.notifiedAt),
            { addSuffix: false },
          );
          const isUnread = !notification.readAt;

          const notificationElement = (
            <div
              className={`flex items-start gap-3 px-3 py-2.5 border-b border-border/50 last:border-0 ${isUnread ? "bg-muted/30" : ""
                }
                ${content.url ? "hover:bg-muted/50 cursor-pointer" : ""}`}
            >
              <div
                className={`w=7 h-7 rounded-full ${content.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
              >
                {content.icon}
              </div>
              <div className="flex -1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">
                    {content.title}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {content.description}
                </p>
              </div>
              {isUnread && (
                <div className="w-2 h-2 rounded-full bg-[#127A4D] flex-shrink-0 mt-2" />
              )}
            </div>
          );

          return content.url ? (
            <a
              key={notification.id}
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {notificationElement}
            </a>
          ) : (
            <div key={notification.id}>{notificationElement}</div>
          );
        })}
      </div>
    </div>
  );
}

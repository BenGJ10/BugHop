import { prisma } from "@/lib/prisma";

interface LogFilters {
  type?: string | null;
  repoId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

interface LogEntry {
  id: string;
  type: "pr" | "issue";
  number: number;
  title: string;
  repository: string;
  date: Date;
}

//have a look at shadcn data table docs to understand this better, becuase the typescript is a bit no-so favourable for beginners

export async function getFilteredLogs(userId: string, filters: LogFilters) {
  // Step 1: Get the user and all their repos
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      installations: {
        include: {
          repositories: true,
        },
      },
    },
  });

  if (!user) return null;

  // Step 2: Collect every repo ID the user has access to
  const repositoryIds: string[] = [];
  for (const installation of user.installations) {
    for (const repo of installation.repositories) {
      repositoryIds.push(repo.id);
    }
  }

  if (repositoryIds.length === 0) {
    return { logs: [], total: 0, repositories: [] };
  }

  // Step 3: Figure out which repos to query
  // If they picked a specific repo, use that. Otherwise use all their repos.
  let repoFilter;
  if (filters.repoId) {
    repoFilter = { repositoryId: filters.repoId };
  } else {
    repoFilter = { repositoryId: { in: repositoryIds } };
  }

  // Step 4: Figure out the date range (if any)
  let hasDateFilter = false;
  const dateFilter: { gte?: Date; lte?: Date } = {};

  if (filters.startDate) {
    dateFilter.gte = new Date(filters.startDate);
    hasDateFilter = true;
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
    hasDateFilter = true;
  }

  // Step 5: Fetch PRs and issues, then combine them into one list
  const logs: LogEntry[] = [];
  const seenKeys = new Set<string>();

  // Fetch PRs (skip if user only wants issues)
  if (filters.type !== "issue") {
    const prWhere: Record<string, unknown> = { ...repoFilter };
    if (hasDateFilter) {
      prWhere.reviewedAt = dateFilter;
    }

    const prs = await prisma.pullRequest.findMany({
      where: prWhere,
      include: { repository: true },
      orderBy: { reviewedAt: "desc" },
    });

    for (const pr of prs) {
      const key = `pr-${pr.repository.fullName}-${pr.number}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        logs.push({
          id: pr.id,
          type: "pr",
          number: pr.number,
          title: pr.title,
          repository: pr.repository.fullName,
          date: pr.reviewedAt,
        });
      }
    }
  }

  // Fetch issues (skip if user only wants PRs)
  if (filters.type !== "pr") {
    const issueWhere: Record<string, unknown> = { ...repoFilter };
    if (hasDateFilter) {
      issueWhere.analyzedAt = dateFilter;
    }

    const issues = await prisma.issue.findMany({
      where: issueWhere,
      include: { repository: true },
      orderBy: { analyzedAt: "desc" },
    });

    for (const issue of issues) {
      const key = `issue-${issue.repository.fullName}-${issue.number}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        logs.push({
          id: issue.id,
          type: "issue",
          number: issue.number,
          title: issue.title,
          repository: issue.repository.fullName,
          date: issue.analyzedAt,
        });
      }
    }
  }

  // Step 6: Sort everything by date (newest first)
  logs.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Step 7: Build the list of repos for the filter dropdown
  const repositories: { id: string; fullName: string }[] = [];
  for (const installation of user.installations) {
    for (const repo of installation.repositories) {
      repositories.push({ id: repo.id, fullName: repo.fullName });
    }
  }

  return { logs, total: logs.length, repositories };
}

export async function getDashboardStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      installations: {
        include: {
          repositories: {
            include: {
              pullRequests: { orderBy: { reviewedAt: "desc" } },
              issues: { orderBy: { analyzedAt: "desc" } },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  const repositories = user.installations.flatMap(inst => inst.repositories) || [];
  const installation = user.installations[0]; // fallback, but repositories is what matters

  let totalPRs = 0;
  let totalIssues = 0;
  const prsByDate: Record<string, number> = {};
  const issuesByDate: Record<string, number> = {};

  for (const repo of repositories) {
    totalPRs += repo.pullRequests.length;
    totalIssues += repo.issues.length;

    for (const pr of repo.pullRequests) {
      const date = pr.reviewedAt.toISOString().split("T")[0];
      prsByDate[date] = (prsByDate[date] || 0) + 1;
    }
    for (const issue of repo.issues) {
      const date = issue.analyzedAt.toISOString().split("T")[0];
      issuesByDate[date] = (issuesByDate[date] || 0) + 1;
    }
  }

  return {
    user,
    installation,
    repositories,
    totalPRs,
    totalIssues,
    prsByDate,
    issuesByDate,
  };
}

export function buildChartData(
  prsByDate: Record<string, number>,
  issuesByDate: Record<string, number>,
) {
  const chartData = [];
  const now = new Date();

  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    chartData.push({
      date: dateStr,
      pullRequests: prsByDate[dateStr] || 0,
      issues: issuesByDate[dateStr] || 0,
    });
  }

  return chartData;
}

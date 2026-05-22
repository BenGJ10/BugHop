import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getUserWithInstallations,
  incrementUsageCounter,
  checkPlanLimit,
} from "@/lib/data/users";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // repoFullName is null → search all repos; a string → search specific repo
    const { question, repoFullName } = await req.json();
    if (!question) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 },
      );
    }

    const user = await getUserWithInstallations(userId);

    if (!user) {
      return NextResponse.json(
        {
          error:
            "User profile not synced yet. Make sure the Clerk webhook is configured and re-login.",
        },
        { status: 404 },
      );
    }

    if (!checkPlanLimit(user.plan, user.chatMessagesUsed, "chat")) {
      return NextResponse.json(
        { error: "chat limit reached" },
        { status: 403 },
      );
    }

    const allRepos = user.installations.flatMap((inst) => inst.repositories);

    if (allRepos.length === 0) {
      return NextResponse.json(
        { error: "Connect a GitHub repository before using chat" },
        { status: 400 },
      );
    }

    // Validate that the requested repo actually belongs to this user
    let resolvedRepo: string | null = null;
    if (repoFullName) {
      const owned = allRepos.find((r) => r.fullName === repoFullName);
      if (!owned) {
        return NextResponse.json(
          { error: "Repository not found in your installations" },
          { status: 403 },
        );
      }
      resolvedRepo = owned.fullName;
    }
    // resolvedRepo === null means "search all repos" — backend handles this correctly

    // Pick any installation (needed for potential auth, though chat doesn't strictly require it)
    const installation = user.installations[0];

    const backendUrl = process.env.BACKEND_URL;
    const res = await fetch(`${backendUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        installationId: String(installation.installationId),
        question,
        repo: resolvedRepo, // null → backend skips the repo filter
      }),
    });

    const data = await res.json();

    await incrementUsageCounter(user.id, "chatMessagesUsed");

    return NextResponse.json({ answer: data.answer });
  } catch (error) {
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}

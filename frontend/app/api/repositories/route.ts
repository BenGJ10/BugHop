import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDashboardStats } from "@/lib/data/logs";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getDashboardStats(userId);

    if (!stats) {
      return NextResponse.json({ repositories: [] });
    }

    const { repositories } = stats as any;

    return NextResponse.json({
      repositories: repositories.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        indexingStatus: repo.indexingStatus,
        createdAt: repo.createdAt,
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

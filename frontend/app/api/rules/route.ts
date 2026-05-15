import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/data/users";
import {
  getRulesByUserId,
  createRule,
  countRulesByUserId,
} from "@/lib/data/rules";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const rules = await getRulesByUserId(user.id);

    return NextResponse.json({ rules });
  } catch (error) {
    console.error("GET /api/rules error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const exsistingRulesCount = await countRulesByUserId(user.id);
    const maxRules = user.plan === "PRO" ? 50 : 50; // Made free plan more generous for now

    if (exsistingRulesCount >= maxRules) {
      return NextResponse.json(
        { error: "Max rules reached" },
        { status: 403 },
      );
    }

    const rule = await createRule(user.id, content);

    return NextResponse.json({ rule });
  } catch (error) {
    console.error("POST /api/rules error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}

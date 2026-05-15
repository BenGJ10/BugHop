import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/data/users";
import { getRuleById, updateRule, deleteRule } from "@/lib/data/rules";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params
    const content = await req.json()

    const rule = await updateRule(id, content)

    return NextResponse.json({rule})
  } catch (error) {
    return NextResponse.json(
      { error: "internal server used" },
      { status: 500 }
    );
  }
}

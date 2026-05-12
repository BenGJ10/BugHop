import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateIndexingStatus, upsertRepository } from "@/lib/data/repositories";

export async function POST(req: NextRequest) {
	try {
		const { repoFullName, status, installationId, repoGithubId, repoName } =
			await req.json();

		if (!repoFullName || !status) {
			return NextResponse.json(
				{ error: "missing required fields" },
				{ status: 400 },
			);
		}

		if (installationId && repoGithubId) {
			const installation = await prisma.installation.findUnique({
				where: {
					installationId: Number(installationId),
				},
			});

			if (installation) {
				const fallbackName = repoFullName.split("/")[1] || repoFullName;
				await upsertRepository(
					BigInt(repoGithubId),
					repoName || fallbackName,
					repoFullName,
					installation.id,
				);
			}
		}

		await updateIndexingStatus(repoFullName, status);

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "internal server used" },
			{ status: 500 },
		);
	}
}

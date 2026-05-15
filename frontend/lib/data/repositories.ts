import { prisma } from "@/lib/prisma";

export async function findRepoWithInstallation(repoFullName: string) {
  return prisma.repository.findFirst({
    where: {
      fullName: repoFullName,
    },
    include: {
      installation: {
        select: {
          userId: true,
        },
      },
    },
  });
}

export async function upsertRepository(
  githubId: bigint | number,
  name: string,
  fullName: string,
  installationId: string,
) {
  try {
    const repo = await prisma.repository.upsert({
      where: {
        githubId,
      },
      create: {
        githubId,
        name,
        fullName,
        installationId,
      },
      update: {
        name,
        fullName,
      },
    });
    console.log("repository upserted in db successfully")
    return repo;
  } catch (error) {
    console.log("Error in upsertRepository:", {error})
  }
}

export async function updateIndexingStatus(
  repoFullName: string,
  status: string,
) {
  return prisma.repository.updateMany({
    where: {
      fullName: repoFullName,
    },
    data: {
      indexingStatus: status,
    },
  });
}

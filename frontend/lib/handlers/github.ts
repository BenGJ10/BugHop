import { prisma } from "@/lib/prisma";
import { upsertRepository } from "@/lib/data/repositories";

export async function handleInstallationCreated(payload: any) {
  try {
    const installationId = payload.installation.id;
    const accountLogin = payload.installation.account.login;
    const repositories = payload.repositories || [];

    const exsistingInstallation = await prisma.installation.findUnique({
      where: {
        installationId,
      },
    });

    if (exsistingInstallation) {
      if (exsistingInstallation.accountLogin === "pending") {
        await prisma.installation.update({
          where: {
            id: exsistingInstallation.id,
          },
          data: {
            accountLogin,
          },
        });
      }

      for (const repo of repositories) {
        await upsertRepository(
          BigInt(repo.id),
          repo.name,
          repo.full_name,
          exsistingInstallation.id,
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export async function handlePullRequestOpened(payload: any) {
  try {
    const installationId = payload.installation.id;
    const pr = payload.pull_request;
    const repo = payload.repository;

    const installation = await prisma.installation.findUnique({
      where: {
        installationId,
      },
      include: {
        user: true,
      },
    });

    const repository = await upsertRepository(
      BigInt(repo.id),
      repo.name,
      repo.full_name,
      installation!.id,
    );

    await prisma.pullRequest.create({
      data: {
        githubId: BigInt(pr.id),
        number: pr.number,
        title: pr.title,
        repositoryId: repository.id,
      },
    });

    const headBranch = pr.head.ref || "";
    const isAutoPR = headBranch.startsWith("bughop/");

    if (isAutoPR) {
      const updatesUser = await prisma.user.update({
        where: {
          id: installation!.userId,
        },
        data: {
          prsCreated: {
            increment: 1,
          },
          prsUsed: {
            increment: 1,
          },
        },
      });
    } else {
      const updatedUser = await prisma.user.update({
        where: {
          id: installation.userId,
        },
        data: {
          prsUsed: {
            increment: 1,
          },
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
}

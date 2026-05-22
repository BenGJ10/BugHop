import inngest

from app.inngest import inngest_client


async def handle_installation(payload):
    installation_id = str(payload["installation"]["id"])
    account = payload["installation"]["account"]["login"]
    repositories = payload.get("repositories", [])

    if not repositories:
        print("Installation payload contains no repositories; skipping indexing trigger.")
        return

    events = []
    for repo in repositories:
        events.append(
            inngest.Event(
                name="installation/created",
                data={
                    "installation_id": installation_id,
                    "account": account,
                    "repositories": repositories,
                    "repo_name": repo["name"],
                },
            )
        )

    try:
        await inngest_client.send(events)
    except Exception as exc:
        # Inngest may be unavailable in local dev; avoid failing the webhook.
        print(f"Inngest send failed: {exc}")


async def handle_installation_repositories(payload):
    installation_id = str(payload["installation"]["id"])
    account = payload["installation"]["account"]["login"]
    repos_added = payload.get("repositories_added", [])

    if not repos_added:
        print("No repositories added in installation_repositories event.")
        return

    events = []
    for repo in repos_added:
        events.append(
            inngest.Event(
                name="installation/created",
                data={
                    "installation_id": installation_id,
                    "account": account,
                    "repositories": repos_added,
                    "repo_name": repo["name"],
                },
            )
        )

    try:
        await inngest_client.send(events)
    except Exception as exc:
        print(f"Inngest send failed: {exc}")

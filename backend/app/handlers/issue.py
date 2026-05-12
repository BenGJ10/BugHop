import inngest

from app.inngest import inngest_client
from app.services import embeddings, github, llm, vectordb
from app.services.frontend import fetch_custom_rules, log_issue_analysis


async def handle_issue(payload):
    installation_id = str(payload["installation"]["id"])
    issue = payload["issue"]
    repo = payload["repository"]
    owner = repo["owner"]["login"]
    repo_name = repo["name"]
    issue_number = issue["number"]
    title = issue["title"]
    description = issue.get("body", "") or ""

    token = await github.get_installation_token(installation_id)

    repo_full_name = f"{owner}/{repo_name}"
    related_code = ""
    seen_chunks = set()

    query = f"{title}\n{description}"
    query_embedding = await embeddings.create_embedding(query[:8000])
    search_results = await vectordb.search(query_embedding, limit=10, repo=repo_full_name)

    for point in search_results:
        payload_data = point.payload
        path = payload_data.get("path", "")
        name = payload_data.get("name", "")
        chunk_id = f"{path}::{name}"

        if path and chunk_id not in seen_chunks:
            content = payload_data.get("content", "")
            chunk_type = payload_data.get("chunk_type", "code")

            header = f"File: {path}"
            if name:
                header += f" | {chunk_type}: {name}"

            related_code += f"\n-- {header} ---\n{content}\n"
            seen_chunks.add(chunk_id)

    custom_rules = await fetch_custom_rules(installation_id)

    comment = await llm.help_with_issue(
        title=title,
        description=description,
        related_code=related_code,
        custom_rules=custom_rules,
    )

    await github.post_comment(owner, repo_name, issue_number, comment, token)
    issue_github_id = issue.get("id", 0)
    await log_issue_analysis(
        f"{owner}/{repo_name}", issue_number, title, issue_github_id
    )

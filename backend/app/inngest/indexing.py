import asyncio
import uuid

import inngest

from app.core.config import settings
from app.inngest.client import inngest_client
from app.services import embeddings, github, vectordb
from app.services.chunker import chunk_code, create_chunk_text_for_embedding
from app.services.frontend import update_indexing_status


def make_chunk_id(repo_full_name: str, file_path: str, start_line: int, end_line: int) -> str:
    source = f"{repo_full_name}:{file_path}:{start_line}:{end_line}"
    return str(uuid.uuid5(uuid.NAMESPACE_URL, source))


async def _embed_batch(repo_full_name, chunks):
    texts = [create_chunk_text_for_embedding(chunk) for chunk in chunks]
    vectors = await embeddings.create_embeddings(texts)

    # Fix #5: validate vector count matches chunk count before zip
    if len(vectors) != len(chunks):
        raise ValueError(
            f"Embedding count mismatch for {repo_full_name}: "
            f"expected {len(chunks)}, got {len(vectors)}"
        )

    points = []
    for chunk, vector in zip(chunks, vectors):
        chunk_id = make_chunk_id(
            repo_full_name, chunk.file_path, chunk.start_line, chunk.end_line
        )
        points.append(
            vectordb.create_point(
                id=chunk_id,
                vector=vector,
                payload={
                    "repo": repo_full_name,
                    "path": chunk.file_path,
                    "content": chunk.content,
                    "chunk_type": chunk.chunk_type,
                    "name": chunk.name,
                    "language": chunk.language,
                    "start_line": chunk.start_line,
                    "end_line": chunk.end_line,
                },
            )
        )
    return points


@inngest_client.create_function(
    fn_id="handle_installation",
    trigger=inngest.TriggerEvent(event="installation/created"),
)
async def handle_installation(ctx: inngest.Context) -> dict:
    installation_id = ctx.event.data["installation_id"]
    account = ctx.event.data["account"]
    repo_name = ctx.event.data["repo_name"]
    repo_full_name = f"{account}/{repo_name}"

    token = await github.get_installation_token(installation_id)

    repo_github_id = None
    repo_display_name = repo_name
    try:
        repo_metadata = await github.get_repo_metadata(account, repo_name, token)
        repo_github_id = repo_metadata.get("id")
        repo_display_name = repo_metadata.get("name", repo_name)
    except Exception as exc:
        print(f"Failed to fetch repo metadata: {exc}")

    # Fix #1: wrap so a bad frontend response can't kill the entire indexing job
    try:
        await update_indexing_status(
            repo_full_name,
            "INDEXING",
            installation_id=installation_id,
            repo_github_id=repo_github_id,
            repo_name=repo_display_name,
        )
    except Exception as exc:
        print(f"update_indexing_status(INDEXING) failed (non-fatal): {exc}")

    files = github.iter_repo_files(account, repo_name, token)

    pending_points = []
    points_upserted = 0
    total_chunks = 0
    total_files = 0
    semaphore = asyncio.Semaphore(max(1, settings.embedding_concurrency))

    async for file in files:
        total_files += 1
        file_path = file["path"]
        content = file["content"]

        chunks = chunk_code(content, file_path)
        total_chunks += len(chunks)
        batch_size = max(1, settings.embedding_batch_size)
        tasks = []
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i : i + batch_size]

            async def run(batch=batch):
                async with semaphore:
                    return await _embed_batch(repo_full_name, batch)

            tasks.append(asyncio.create_task(run()))

        # Fix #4: isolate per-file failures — one bad file won't crash the whole job
        for task in asyncio.as_completed(tasks):
            try:
                points = await task
                pending_points.extend(points)
                if len(pending_points) >= settings.qdrant_upsert_batch_size:
                    # Fix #7: upsert_embeddings is now async (uses asyncio.to_thread internally)
                    await vectordb.upsert_embeddings(pending_points)
                    points_upserted += len(pending_points)
                    pending_points.clear()
            except Exception as exc:
                print(f"Embedding batch failed for {file_path}, skipping: {exc}")

    if pending_points:
        await vectordb.upsert_embeddings(pending_points)
        points_upserted += len(pending_points)

    # Fix #1: same guard on the final status update
    try:
        await update_indexing_status(
            repo_full_name,
            "COMPLETED",
            installation_id=installation_id,
            repo_github_id=repo_github_id,
            repo_name=repo_display_name,
        )
    except Exception as exc:
        print(f"update_indexing_status(COMPLETED) failed (non-fatal): {exc}")

    return {
        "status": "completed",
        "repo": repo_full_name,
        "files_indexed": total_files,
        "chunks_indexed": total_chunks,
        "points_upserted": points_upserted,
    }

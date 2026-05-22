import asyncio

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchValue,
    PayloadSchemaType,
    PointStruct,
    VectorParams,
)
from urllib.parse import urlparse, urlunparse

from app.core.config import settings


def _normalize_qdrant_url(raw_url: str) -> str:
    if not raw_url:
        return raw_url

    parsed = urlparse(raw_url)
    if not parsed.scheme or not parsed.netloc:
        return raw_url

    if parsed.port is not None:
        return raw_url

    netloc = f"{parsed.hostname}:6333"
    return urlunparse(
        (parsed.scheme, netloc, parsed.path, parsed.params, parsed.query, parsed.fragment)
    )


client = QdrantClient(
    url=_normalize_qdrant_url(settings.qdrant_url),
    api_key=settings.qdrant_api_key,
)

COLLECTION_NAME = "bughop"


def init_collection():
    try:
        if client.collection_exists(collection_name=COLLECTION_NAME):
            return

        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=settings.embedding_dim, distance=Distance.COSINE),
        )
    except Exception as exc:
        print(f"Qdrant create_collection failed: {exc}")

    try:
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="repo",
            field_schema=PayloadSchemaType.KEYWORD,
        )
    except Exception as exc:
        print(f"Qdrant create_payload_index failed: {exc}")


# Fix #7: async so the sync Qdrant client doesn't block the event loop
async def upsert_embeddings(points):
    if not points:
        return

    batch_size = max(1, settings.qdrant_upsert_batch_size)
    for i in range(0, len(points), batch_size):
        batch = points[i : i + batch_size]
        await asyncio.to_thread(
            client.upsert,
            collection_name=COLLECTION_NAME,
            points=batch,
            timeout=settings.qdrant_timeout_seconds,
        )


async def search(embedding, repo, limit=5):
    query_filter = None
    if repo:
        query_filter = Filter(
            must=[FieldCondition(key="repo", match=MatchValue(value=repo))]
        )

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=embedding,
        query_filter=query_filter,
        with_payload=True,
        limit=limit,
    )
    return results.points


def create_point(id, vector, payload):
    return PointStruct(id=id, vector=vector, payload=payload)


def get_client():
    return client

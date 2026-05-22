# Database Schema & Vector Database Layout

This document explains BugHop's database architecture. It details the relational database schema managed by Prisma/PostgreSQL in the Next.js gateway and the high-performance vector schemas indexed in Qdrant.

---

## 1. Relational Database Schema (Next.js / Prisma)

The relational database acts as the single source of truth for user accounts, installations, custom guidelines, and event tracking metrics. It is managed via PostgreSQL and defined in `schema.prisma`.

```mermaid
erDiagram
    User ||--o{ Rule : "defines"
    User ||--o{ Installation : "installs"
    Installation ||--o{ Repository : "contains"
    Repository ||--o{ PullRequest : "logs"
    Repository ||--o{ Issue : "logs"

    User {
        string id PK "Clerk / OAuth User ID"
        string email UNIQUE
        Plan plan "FREE | PRO"
        string polarCustomerId
        string polarSubscriptionId
        int prsUsed
        int prsCreated
        int issuesUsed
        int chatMessagesUsed
        datetime billingCycleStart
        datetime createdAt
        datetime updatedAt
    }

    Rule {
        string id PK
        string content "Custom guideline text"
        string userId FK
        datetime createdAt
        datetime updatedAt
    }

    Installation {
        string id PK
        int installationId UNIQUE "GitHub App Installation ID"
        string accountLogin "GitHub username or organization name"
        string userId FK
        datetime createdAt
    }

    Repository {
        string id PK
        bigint githubId UNIQUE "GitHub Repo ID"
        string name "Repo name"
        string fullName "owner/repo"
        string installationId FK
        IndexingStatus indexingStatus "NOT_STARTED | INDEXING | COMPLETED | FAILED"
        datetime createdAt
    }

    PullRequest {
        string id PK
        bigint githubId
        int number "PR # ID"
        string title
        string repositoryId FK
        datetime reviewedAt
    }

    Issue {
        string id PK
        bigint githubId
        int number "Issue # ID"
        string title
        string repositoryId FK
        datetime analyzedAt
    }
```

### 1.1. Key Models & Relationships
* **User**: Connects users to billing subscription IDs (via Polar billing provider integration) and tracks quota limits. Quotas are critical for protecting AI resources: `prsUsed` (amount of code reviews completed), `prsCreated` (number of Auto PRs generated), `issuesUsed` (number of issue analyses run), and `chatMessagesUsed`.
* **Rule**: Represents a custom coding guideline defined by a user (e.g., *"All functions must have descriptive Docstrings"*, *"Use composition instead of inheritance"*). These are fetched on-the-fly and injected into the LLM context to tailor feedback to a team's styling standards.
* **Installation**: Maps a GitHub App installation ID to the user who authorized it.
* **Repository**: Logs the Git repositories that have been crawled. The `indexingStatus` field manages the state machine (`NOT_STARTED` -> `INDEXING` -> `COMPLETED`/`FAILED`), which is displayed on the UI dashboard during codebase ingestion.
* **PullRequest & Issue**: Serves as transactional event logs, providing audit records of the files analyzed and suggestions made by the agent.

---

## 2. Vector Database Layout (Qdrant)

The FastAPI backend interacts with a **Qdrant Vector Database**. Qdrant handles similarity searches, storing chunks of code parsed by tree-sitter alongside structured metadata payloads.

### 2.1. Vector Collection Specification
* **Collection Name**: `"bughop"`
* **Vector Configuration**:
  * **Dimension**: `1536` (matching the output size of the `models/text-embedding-004` Google embedding model).
  * **Distance Metric**: `Distance.COSINE` (Cosine similarity is used as the standard metric for comparing text embeddings).

### 2.2. Deterministic Point IDs (`make_chunk_id`)
To prevent duplicate entries and support efficient re-indexing, BugHop implements a **Deterministic Vector ID Generation** scheme using `uuid.uuid5` (`app/inngest/indexing.py`):
```python
def make_chunk_id(repo_full_name: str, file_path: str, start_line: int, end_line: int) -> str:
    source = f"{repo_full_name}:{file_path}:{start_line}:{end_line}"
    return str(uuid.uuid5(uuid.NAMESPACE_URL, source))
```
* **Why Deterministic UUIDs?** 
  If a developer re-triggers repository indexing, the crawler parses the same files. Since the UUID depends on the repository name, file path, and exact start/end lines, Qdrant will overwrite the existing vector points rather than duplicating them. This ensures idempotency.

### 2.3. Payload Schema & Indexing
Each vector point holds a rich metadata payload:
```json
{
  "id": "c005ba33-8a03-5182-8bc1-bc8eb7469a4c",
  "vector": [0.0125, -0.0034, ..., 0.0894],
  "payload": {
    "repo": "owner/repo-name",
    "path": "app/core/config.py",
    "content": "class Settings(BaseSettings):...",
    "chunk_type": "class",
    "name": "Settings",
    "language": "python",
    "start_line": 10,
    "end_line": 41
  }
}
```

* **Production Index Optimization**: 
  A keyword index is created programmatically on the `"repo"` payload attribute:
  ```python
  client.create_payload_index(
      collection_name="bughop",
      field_name="repo",
      field_schema=PayloadSchemaType.KEYWORD,
  )
  ```
  This creates an inverted keyword index on the repository string in Qdrant. When searching vectors, Qdrant filters the space by the `"repo"` keyword *before* performing high-dimensional vector math. This dramatically reduces retrieval latency and avoids data leakage between repositories.

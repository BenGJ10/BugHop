# Authentication, Access Control & Security Model

This document explains the security mechanisms, token management procedures, and authorization models implemented in the BugHop backend.

---

## 1. Gateway Proxy Security Pattern

As analyzed in the architecture, BugHop does not expose raw database tables or execute raw webhook signature validation on the backend worker. Instead, security is maintained through a **Multi-Tiered Gateway Validation Architecture**.

```
[GitHub Webhook]
       │ (1) Hashed Signature: x-hub-signature-256
       ▼
[Next.js Gateway Server] ── (2) Validates signature against GITHUB_WEBHOOK_SECRET
       │
       ├─ (3) Valid? Process relational database actions (Prisma SQL)
       ▼
[Internal VPC / Secure Bridge] ── (4) Forwards raw payload: POST {event, payload}
       ▼
[FastAPI Backend Worker] ── (5) Executes high-performance LLM / Vector actions
```

### Benefits of the Pattern:
* **Centralized Signature Verification**: Webhook cryptography signature verification (using `@octokit/webhooks` library and the `GITHUB_WEBHOOK_SECRET`) is managed exclusively by the Next.js gateway, offloading heavy CPU cryptographic operations from the backend worker.
* **Network Isolation**: In a production environment, the backend FastAPI worker can be placed in a private subnet, accepting connections solely from the Next.js gateway's IP block or a secure VPC peering bridge, minimizing the external attack surface.

---

## 2. GitHub App Token Lifecycle Management

The backend must communicate with GitHub to read code files, create branches, write modifications, post issue comments, and open Pull Requests. Rather than using static tokens, BugHop leverages short-lived, scoped **Installation Access Tokens** issued by GitHub.

### 2.1. JWT-Signed RS256 Authentication Flow
To query GitHub for an installation token, the backend must prove its identity. It does this by generating a JSON Web Token (JWT) signed with the GitHub App's **RS256 Private Key**:

1. **JWT Struct Assembly (`app.services.github.auth`)**:
   ```python
   now = int(time.time())
   iat = now - 60   # clock-skew allowance
   exp = now + 540  # 9-minute token expiration limit (max 10 allowed by GitHub)
   payload = {
       "iat": iat,
       "exp": exp,
       "iss": settings.github_app_id  # GitHub App ID
   }
   ```
2. **Private Key Cryptography**:
   The payload is encrypted using the RS256 algorithm and the PEM-formatted RSA private key (`settings.github_private_key`).
3. **Installation Token Exchange**:
   The signed JWT is sent via POST to `/app/installations/{installation_id}/access_tokens`. GitHub validates the signature against the App's public key, returning a short-lived **Installation Access Token** scoped specifically to the repositories accessible by that installation ID.

### 2.2. Development Bypass (Personal Access Token)
For local debugging and offline development, creating a full GitHub App and completing the JWT signing setup can be challenging. BugHop implements a convenient fallback mechanism inside `auth.py`:
```python
if settings.environment == "development" and settings.github_pat:
    return settings.github_pat
```
If a `GITHUB_PAT` (Personal Access Token) is detected in a development environment, the backend automatically uses it directly. This streamlines local developer onboarding.

---

## 3. Webhook Retries & Transient Error Recovery

Production APIs suffer from network blips, socket drops, and rate limits. The backend's low-level HTTP client (`app.services.github.client`) features a built-in **Resilience and Transient Error Handling Engine**:

* **Exponential Backoff Retry**: 
  When making a request to GitHub, the client intercepts standard socket exceptions (`httpx.TimeoutException`, `httpx.ConnectError`).
  It automatically retry-cycles the call up to 3 times, applying an exponential backoff sleep delay (`0.6 * attempt` seconds) between attempts.
* **Deterministic Failures**: 
  If an API response returns an HTTP 4xx client error (e.g. 400 Bad Request, 401 Unauthorized, 404 Not Found), the loop terminates and throws a `RuntimeError` immediately. This prevents wasting API rate limit tokens on requests that cannot succeed.

---

## 4. Multi-Tenant Code Isolation

A primary security concern in multi-tenant SaaS platforms is **data leakage** (e.g., User A searching Vector databases and retrieving User B's code).

BugHop guarantees strict codebase isolation at the database layer:
1. **GitHub App Scoping**: An installation token can **only** access repositories that belong to the installing account or organization.
2. **Qdrant Keyed Querying**:
   * During indexing (`indexing.py`), all points inserted into the `"bughop"` collection contain a `"repo"` property in their payload containing the full repository name (`owner/repo`).
   * When a search is triggered (`POST /chat` or handlers in `issue.py`/`pull_request.py`), the backend **enforces** a Qdrant metadata query filter:
     ```python
     query_filter = Filter(
         must=[FieldCondition(key="repo", match=MatchValue(value=repo))]
     )
     ```
   * Because of this pre-filtering condition, the vector database similarity matching algorithm is restricted to vectors matching that specific repository.

---

## 5. Security Recommendations for Production

As BugHop scales to an enterprise platform, the following security measures are recommended:
1. **API Signature Validation**: Add an api-key signature or Shared HMAC Webhook Secret check on the backend `POST /webhook` endpoint. This ensures that the backend *only* accepts requests from the Next.js gateway.
2. **Strict CORS Settings**: Change `allow_origins=["*"]` in `main.py` to target the explicit production URL of the Next.js frontend, preventing malicious browser scripts from interacting with the `/chat` endpoint.
3. **Secrets Manager Integration**: In production, inject `GITHUB_PRIVATE_KEY` and `GOOGLE_API_KEY` dynamically using AWS Secrets Manager or Google Cloud Secret Manager, rather than loading them as plaintext environment variables.

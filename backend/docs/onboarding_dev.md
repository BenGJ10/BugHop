# Developer Onboarding, Debugging & Extension Guide

Welcome to the BugHop development team! This guide will help you set up your local development environment, debug the system, and implement new features safely.

---

## 1. Quickstart: Local Environment Setup

The BugHop backend is built with Python 3.13 and FastAPI. Package management and virtual environments are controlled using `uv`.

### 1.1. Prerequisites
Ensure you have the following installed:
* Python `>= 3.13`
* `uv` (Fast Python package manager)
* Docker (for running Qdrant locally)
* Node.js (for running the Inngest local development server)

### 1.2. Local Environment Bootstrapping
1. **Clone the repository**:
   ```bash
   git clone https://github.com/anshdeshwal31/BugHop.git
   cd BugHop/backend
   ```
2. **Install dependencies**:
   ```bash
   uv sync
   ```
   This reads `pyproject.toml` and `uv.lock`, automatically boots up a Python 3.13 virtual environment (`.venv`), and installs all dependencies including tree-sitter language libraries.
3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys. For local development, you should at least configure:
   ```properties
   ENVIRONMENT=development
   GOOGLE_API_KEY=your_gemini_api_key
   QDRANT_URL=http://localhost:6333
   # Fallback development PAT (allows bypassing full GitHub App setup)
   GITHUB_PAT=your_github_personal_access_token
   FRONTEND_URL=http://localhost:3000
   ```

4. **Spin up local infrastructure (Docker)**:
   Start Qdrant locally:
   ```bash
   docker run -p 6333:6333 -p 6334:6334 \
     -v $(pwd)/qdrant_storage:/qdrant/storage:z \
     qdrant/qdrant
   ```

5. **Start the Inngest Dev Server**:
   Inngest relies on a local runner to trigger background queues. In a new terminal window, start the Inngest dev server pointing to the FastAPI port:
   ```bash
   npx inngest-cli@latest dev -u http://localhost:8000/api/inngest
   ```

6. **Run the FastAPI server**:
   ```bash
   uv run main.py
   # Or directly run:
   # uv run uvicorn main:app --reload --port 8000
   ```

Your backend server is now running at `http://localhost:8000` with hot-reloading enabled. You can view the automatically generated interactive OpenAPI docs at `http://localhost:8000/docs`.

---

## 2. "How to Debug the Project" Guide

Debugging a distributed, event-driven AI agent requires specific strategies. Below are the key tools and procedures.

### 2.1. Inspecting Live Workflows (Inngest Dev Panel)
If repository indexing fails or Auto PR generation gets stuck, do not blindly scan log files. Open the local **Inngest Dev Console** at:
`http://localhost:8288`
* **Features**:
  * View every dispatched event (e.g. `installation/created`, `issue/auto-pr`).
  * Inspect the exact step-by-step inputs, variables, and outputs of `indexing.py` and `auto_pr.py`.
  * Re-trigger/replay failed runs with a single click.

```
┌────────────────────────────────────────────────────────┐
│ Inngest Local Dev Server running on http://localhost:8288│
├────────────────────────────────────────────────────────┤
│ Events Ingested:                                       │
│  [✓] issue/auto-pr (Step 1: Assembly [✓], Step 2 [✓])  │
│  [✗] installation/created                              │
│      └─ Error: "Resource Exhausted (429)"              │
│         [ Replay Event ] [ Inspect Stacktrace ]        │
└────────────────────────────────────────────────────────┘
```

### 2.2. Validating Qdrant Embeddings Payload
To inspect indexed code chunks, check collection sizes, or delete buggy vectors, visit the Qdrant Dashboard or run simple API queries:
* **Interactive Dashboard**: Open `http://localhost:6333/dashboard` in your browser.
* **REST Curl Diagnostics**:
  ```bash
  # Check collection health
  curl http://localhost:6333/collections/bughop
  
  # Search vectors programmatically for a specific repository
  curl -X POST http://localhost:6333/collections/bughop/points/scroll \
       -H "Content-Type: application/json" \
       -d '{"limit": 5, "filter": {"must": [{"key": "repo", "match": {"value": "owner/repo"}}]}}'
  ```

### 2.3. LLM Failover Logs
To observe cascade fallovers (e.g., Gemini failing over to Groq's Llama models), keep an eye on the Uvicorn shell outputs. `llm.py` prints clear provider routing statements:
```log
[LLM] Using provider: Google/gemini-2.5-flash
[LLM] Fallback triggered from Google/gemini-2.5-flash: 429 RESOURCE_EXHAUSTED
[LLM] Using provider: Groq/llama-3.3-70b-versatile
```

---

## 3. "How to Add New Features Safely" Guide

When extending BugHop (e.g., adding automated unit test generation, issue comment styling, or security vulnerability scanners), follow this production-ready playbook.

### 3.1. Rules for Code Modification
1. **Preserve System Non-Blockage**: Ensure all network-bound API calls are asynchronous (`async/await`) and run CPU-intensive tree-sitter crawling inside worker threads (`asyncio.to_thread`) where appropriate.
2. **Never Store Secret Tokens**: Do not hardcode API keys or credentials. Add them to `app.core.config.Settings` as optional values with sensible defaults.
3. **Idempotence First**: When modifying the database or index collections, ensure that running the action multiple times does not result in duplicate records. Always use deterministic points or key constraints.

### 3.2. Step-by-Step Feature Walkthrough: Adding a "Security Scan" Trigger
Let's add a feature that reviews PR diffs for hardcoded secrets when a PR is opened.

#### Step 1: Update App Configuration (`app/core/config.py`)
If your feature requires a new token, register it:
```python
class Settings(BaseSettings):
    ...
    enable_security_scan: bool = True
```

#### Step 2: Implement Domain Logic (`app/services/security_scanner.py`)
Create a new isolated service file:
```python
import re

async def scan_diff_for_secrets(diff: str) -> list[str]:
    # Simple regex scanner for illustrative purposes
    findings = []
    secret_patterns = [r"api[_-]?key\s*=\s*['\"][a-zA-Z0-9_-]{16,}['\"]"]
    for pattern in secret_patterns:
        if re.search(pattern, diff, re.IGNORECASE):
            findings.append("Potential exposed API Key detected in diff.")
    return findings
```

#### Step 3: Wire into Request Lifecycle Handler (`app/handlers/pull_request.py`)
Integrate your new service into the PR review lifecycle:
```python
from app.services.security_scanner import scan_diff_for_secrets

async def handle_pull_request(payload):
    ...
    # Exclude bot checks
    if pr.get("user", {}).get("type") == "Bot":
        return
        
    token = await github.get_installation_token(installation_id)
    diff = await github.get_pr_diff(owner, repo_name, pr_number, token)
    
    # Execute Scan
    security_findings = await scan_diff_for_secrets(diff)
    if security_findings:
        # Prepend security warning to the final review comment
        comment_prefix = "### ⚠️ Security Scan Warnings:\n" + "\n".join(security_findings) + "\n\n"
    else:
        comment_prefix = ""
        
    ...
    comment = await llm.review_pull_request(...)
    final_comment = comment_prefix + comment
    await github.post_comment(owner, repo_name, pr_number, final_comment, token)
```

#### Step 4: Verify Locally
1. Start local servers (FastAPI, Qdrant, Inngest).
2. Trigger the mock workflow by sending a simulated POST request to `http://localhost:8000/webhook` containing the target payload:
   ```bash
   curl -X POST http://localhost:8000/webhook \
        -H "Content-Type: application/json" \
        -d '{"event": "pull_request", "payload": {"action": "opened", "pull_request": {"number": 1, "title": "Add secrets", "body": "", "user": {"type": "User"}}, "repository": {"name": "test-repo", "owner": {"login": "test-owner"}}, "installation": {"id": 12345}}}'
   ```
3. Verify that your logs register the execution flow and the warnings are appended to the output correctly.

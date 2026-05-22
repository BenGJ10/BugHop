import asyncio
import base64

import httpx

from app.core.config import settings
from app.services.github.client import GITHUB_API, github_request

SKIP_FILES = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "bun.lockb",
    "composer.lock",
    "Gemfile.lock",
    "Pipfile.lock",
    "poetry.lock",
    "cargo.lock",
    "go.sum",
    ".DS_Store",
    "thumbs.db",
}

SKIP_DIRS = {
    "node_modules",
    ".git",
    ".svn",
    ".hg",
    "dist",
    "build",
    ".next",
    ".nuxt",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    "venv",
    ".venv",
    "env",
    ".env",
    "vendor",
    "target",
    "coverage",
    ".coverage",
    ".nyc_output",
}

SKIP_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".ico",
    ".svg",
    ".webp",
    ".bmp",
    ".mp3",
    ".mp4",
    ".wav",
    ".avi",
    ".mov",
    ".webm",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".zip",
    ".tar",
    ".gz",
    ".rar",
    ".7z",
    ".exe",
    ".dll",
    ".so",
    ".dylib",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".otf",
    ".min.js",
    ".min.css",
}

MAX_FILE_SIZE = 100 * 1024


def should_skip_file(path, content_size):
    filename = path.split("/")[-1].lower()

    if filename in SKIP_FILES:
        return True

    path_parts = path.lower().split("/")
    for part in path_parts[:-1]:
        if part in SKIP_DIRS:
            return True

    for ext in SKIP_EXTENSIONS:
        if filename.endswith(ext):
            return True

    if content_size > MAX_FILE_SIZE:
        return True

    return False


async def iter_repo_files(owner, repo, token):
    max_files = settings.github_max_files
    files_seen = 0
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
    }

    async with httpx.AsyncClient(base_url=GITHUB_API) as client:

        async def _get(url):
            for attempt in range(1, 4):
                try:
                    resp = await client.get(
                        url,
                        headers=headers,
                        timeout=settings.github_timeout_seconds,
                    )
                except (httpx.TimeoutException, httpx.ConnectError):
                    if attempt == 3:
                        print(f"GitHub request timed out after retries: {url}")
                        return None
                    await asyncio.sleep(0.6 * attempt)
                    continue

                # Fix #6: retry retriable server errors; skip non-retriable client errors
                if resp.status_code in {429, 500, 502, 503, 504}:
                    if attempt < 3:
                        await asyncio.sleep(0.6 * attempt)
                        continue
                    print(f"GitHub returned {resp.status_code} after retries: {url}")
                    return None
                if resp.status_code >= 400:
                    print(f"GitHub returned {resp.status_code} (non-retriable): {url}")
                    return None
                return resp
            return None

        async def fetch_directory(path=""):
            nonlocal files_seen
            if path:
                dir_name = path.split("/")[-1].lower()
                if dir_name in SKIP_DIRS:
                    return
            resp = await _get(f"/repos/{owner}/{repo}/contents/{path}")
            if resp is None:
                return
            items = resp.json()

            for item in items:
                if max_files and files_seen >= max_files:
                    return
                if item["type"] == "file":
                    if should_skip_file(item["path"], item.get("size", 0)):
                        continue
                    file_resp = await _get(item["url"])
                    if file_resp is None:
                        continue
                    file_data = file_resp.json()

                    # Fix #2: skip binary or non-UTF8 files instead of crashing
                    try:
                        content = base64.b64decode(file_data["content"]).decode("utf-8")
                    except (UnicodeDecodeError, Exception):
                        print(f"Skipping non-UTF8 file: {item['path']}")
                        continue

                    files_seen += 1
                    yield {"path": item["path"], "content": content}

                elif item["type"] == "dir":
                    async for entry in fetch_directory(item["path"]):
                        yield entry

        async for entry in fetch_directory():
            yield entry


async def get_repo_files(owner, repo, token):
    return [entry async for entry in iter_repo_files(owner, repo, token)]


async def get_file_content(owner, repo, path, token, ref=None):
    params = {"ref": ref} if ref else None
    resp = await github_request(
        "GET", f"/repos/{owner}/{repo}/contents/{path}", token, params=params
    )
    data = resp.json()
    content = base64.b64decode(data["content"]).decode("utf-8")
    return {
        "content": content,
        "sha": data["sha"],
        "encoding": data.get("encoding", "base64"),
    }


async def get_default_branch(owner, repo, token):
    resp = await github_request("GET", f"/repos/{owner}/{repo}", token)

    return resp.json()["default_branch"]


async def get_repo_metadata(owner, repo, token):
    resp = await github_request(
        "GET",
        f"/repos/{owner}/{repo}",
        token,
        timeout=settings.github_timeout_seconds,
    )
    if resp.status_code >= 400:
        raise RuntimeError(
            f"Failed to fetch repo metadata ({resp.status_code}): {resp.text}"
        )
    return resp.json()

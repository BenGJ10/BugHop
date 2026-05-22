import time

import jwt

from app.core.config import settings
from app.services.github.client import github_request


async def get_installation_token(installation_id):
    if settings.environment == "development" and settings.github_pat:
        return settings.github_pat

    now = int(time.time())
    # Allow small clock skew and keep JWT lifetime under 10 minutes.
    iat = now - 60
    exp = now + 540
    payload = {"iat": iat, "exp": exp, "iss": settings.github_app_id}
    jwt_token = jwt.encode(payload, settings.github_private_key, algorithm="RS256")

    resp = await github_request(
        "POST", f"/app/installations/{installation_id}/access_tokens", jwt_token
    )

    data = resp.json()
    token = data.get("token")
    if not token:
        raise RuntimeError(f"Installation token missing in response: {data}")

    return token

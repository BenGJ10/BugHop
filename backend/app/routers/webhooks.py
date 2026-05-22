from fastapi import APIRouter, HTTPException

from app.handlers.installation import handle_installation, handle_installation_repositories
from app.handlers.issue import handle_issue, handle_issue_labeled
from app.handlers.pull_request import handle_pull_request
from app.models.schemas import WebhookPayload, WebhookResponse

router = APIRouter()


@router.post("/webhook", response_model=WebhookResponse)
async def handle_webhook(data: WebhookPayload):
    event = data.event
    payload = data.payload

    if event == "installation":
        await handle_installation(payload)
    elif event == "installation_repositories":
        await handle_installation_repositories(payload)
    elif event == "pull_request":
        await handle_pull_request(payload)
    elif event == "issues":
        action = payload.get("action")
        if action == "opened":
            await handle_issue(payload)
        elif action == "labeled":
            await handle_issue_labeled(payload)

    return WebhookResponse(status="success")

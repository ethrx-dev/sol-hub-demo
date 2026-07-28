import asyncio
from typing import Any

import httpx

from src.config import settings


async def score_with_ai(
    innovator_profile: dict[str, Any],
    mentor_profile: dict[str, Any],
    project_data: dict[str, Any],
) -> dict[str, Any] | None:
    if not settings.LLM_API_KEY:
        return None

    system_prompt = (
        "You are a matchmaking AI for a regenerative business incubation platform. "
        "Given an innovator's profile, project details, and a mentor's profile, "
        "score the compatibility from 0-100 and provide a brief explanation."
    )

    user_prompt = (
        f"Innovator profile:\n{innovator_profile}\n\n"
        f"Project details:\n{project_data}\n\n"
        f"Mentor profile:\n{mentor_profile}\n\n"
        "Respond with JSON: {\"score\": <0-100>, \"reason\": \"<brief why this match works>\"}"
    )

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{settings.LLM_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.LLM_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.LLM_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 300,
                    "response_format": {"type": "json_object"},
                },
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            import json
            result = json.loads(content)
            return {
                "score": min(max(int(result.get("score", 0)), 0), 100),
                "reason": result.get("reason", ""),
            }
    except Exception:
        return None

import urllib.parse

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import Response

from src.utils.storage import get_object_bytes

router = APIRouter(prefix="/api/files", tags=["files"])


@router.get("/{storage_key:path}")
async def serve_file(storage_key: str):
    # Defend against path traversal in the storage key.
    decoded = urllib.parse.unquote(storage_key)
    if decoded != storage_key or ".." in decoded or decoded.startswith("/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid key")

    try:
        data, content_type = await get_object_bytes(decoded)
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    return Response(content=data, media_type=content_type or "application/octet-stream")

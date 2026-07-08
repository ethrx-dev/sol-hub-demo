from fastapi import APIRouter, HTTPException, status, UploadFile, File
from src.deps import CurrentUser
from src.schemas.media import UploadResponse
from src.utils.file_validator import validate_file, validate_file_size, generate_storage_key
from src.utils.storage import upload_file

router = APIRouter(prefix="/api/media", tags=["media"])


@router.post("/upload", response_model=UploadResponse)
async def upload_file_endpoint(file: UploadFile = File(...), current_user: CurrentUser = None):
    if current_user.membership_tier == "free":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Upgrade your membership to upload files")

    mime = validate_file(file)
    validate_file_size(file)
    storage_key = generate_storage_key(file, mime)
    data = await file.read()
    url = await upload_file(storage_key, data, mime)

    return UploadResponse(
        url=url,
        storage_key=storage_key,
        file_type=mime,
        file_size=len(data),
    )

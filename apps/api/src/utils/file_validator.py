import uuid
import magic
from fastapi import UploadFile, HTTPException
from starlette import status

ALLOWED_IMAGE_MIMES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_VIDEO_MIMES = {"video/mp4", "video/quicktime"}
ALLOWED_DOC_MIMES = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"}

ALLOWED_MIMES = ALLOWED_IMAGE_MIMES | ALLOWED_VIDEO_MIMES | ALLOWED_DOC_MIMES


def get_file_category(mime: str) -> str:
    if mime in ALLOWED_IMAGE_MIMES:
        return "image"
    if mime in ALLOWED_VIDEO_MIMES:
        return "video"
    return "document"


def validate_file(file: UploadFile) -> str:
    contents = file.file.read(2048)
    file.file.seek(0)
    mime = magic.from_buffer(contents, mime=True)
    if mime not in ALLOWED_MIMES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{mime}' is not allowed",
        )
    return mime


def generate_storage_key(file: UploadFile, mime: str) -> str:
    ext_map = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
        "video/mp4": "mp4",
        "video/quicktime": "mov",
        "application/pdf": "pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "text/plain": "txt",
    }
    ext = ext_map.get(mime, "bin")
    return f"{uuid.uuid4().hex}.{ext}"

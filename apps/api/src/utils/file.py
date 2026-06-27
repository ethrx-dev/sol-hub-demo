import uuid
from pathlib import Path

import boto3
from botocore.config import Config
from fastapi import UploadFile

from src.config import settings

_s3_client = None


def get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            config=Config(signature_version="s3v4"),
        )
    return _s3_client


async def upload_file(file: UploadFile, folder: str) -> str:
    client = get_s3_client()
    ext = Path(file.filename or "file").suffix if file.filename else ""
    key = f"{folder}/{uuid.uuid4().hex}{ext}"
    contents = await file.read()
    client.put_object(
        Bucket=settings.S3_BUCKET,
        Key=key,
        Body=contents,
        ContentType=file.content_type or "application/octet-stream",
    )
    url = f"{settings.S3_ENDPOINT}/{settings.S3_BUCKET}/{key}"
    return url


def delete_file(url: str) -> None:
    client = get_s3_client()
    prefix = f"{settings.S3_ENDPOINT}/{settings.S3_BUCKET}/"
    if url.startswith(prefix):
        key = url[len(prefix):]
        client.delete_object(Bucket=settings.S3_BUCKET, Key=key)

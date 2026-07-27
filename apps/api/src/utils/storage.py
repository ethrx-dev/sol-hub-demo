from src.config import settings

try:
    import boto3
    from botocore.config import Config as BotoConfig

    _s3_client = boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        config=BotoConfig(signature_version="s3v4"),
    )
    _presign_client = boto3.client(
        "s3",
        endpoint_url=settings.S3_PUBLIC_URL,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        config=BotoConfig(signature_version="s3v4"),
    )
except ImportError:
    _s3_client = None
    _presign_client = None


def get_s3_client():
    if _s3_client is None:
        raise RuntimeError("boto3 is not installed")
    return _s3_client


async def upload_file(storage_key: str, data: bytes, content_type: str) -> str:
    client = get_s3_client()
    client.put_object(
        Bucket=settings.S3_BUCKET,
        Key=storage_key,
        Body=data,
        ContentType=content_type,
    )
    return get_public_url(storage_key)


def get_public_url(storage_key: str) -> str:
    """Return a stable, non-expiring URL served through the API (/api/files/...).

    This avoids leaking S3 credentials and sidesteps expiring presigned URLs.
    """
    return f"/api/files/{storage_key}"


def generate_presigned_url(storage_key: str, expires_in: int = 3600) -> str:
    if _presign_client is None:
        raise RuntimeError("boto3 is not installed")
    return _presign_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_BUCKET, "Key": storage_key},
        ExpiresIn=expires_in,
    )


async def get_object_bytes(storage_key: str) -> tuple[bytes, str | None]:
    """Fetch an object's bytes and content type from S3 (used by the file route)."""
    client = get_s3_client()
    resp = client.get_object(Bucket=settings.S3_BUCKET, Key=storage_key)
    body = resp["Body"].read()
    content_type = resp.get("ContentType")
    return body, content_type


async def delete_file(storage_key: str) -> None:
    client = get_s3_client()
    client.delete_object(Bucket=settings.S3_BUCKET, Key=storage_key)

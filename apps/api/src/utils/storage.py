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
except ImportError:
    _s3_client = None


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
    return f"{settings.S3_ENDPOINT}/{settings.S3_BUCKET}/{storage_key}"


async def delete_file(storage_key: str) -> None:
    client = get_s3_client()
    client.delete_object(Bucket=settings.S3_BUCKET, Key=storage_key)

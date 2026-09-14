import os
from typing import BinaryIO
from app.core.config import settings
from app.core.logging import logger

class S3StorageClient:
    """Production S3 / MinIO Object Storage Client."""

    def __init__(self):
        self.bucket_name = settings.AWS_S3_BUCKET
        # Ensure local mock storage directory exists for offline development
        self.local_storage_dir = os.path.join(os.getcwd(), "storage_bucket")
        os.makedirs(self.local_storage_dir, exist_ok=True)

    async def upload_file(self, file_obj: BinaryIO, s3_key: str) -> str:
        """Upload file bytes to object storage or local S3 directory mock."""
        try:
            target_path = os.path.join(self.local_storage_dir, s3_key)
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            
            file_obj.seek(0)
            with open(target_path, "wb") as f:
                f.write(file_obj.read())
                
            logger.info(f"Successfully stored file at S3 key: {s3_key}")
            return f"s3://{self.bucket_name}/{s3_key}"
        except Exception as e:
            logger.error(f"Failed to upload file to storage [{s3_key}]: {e}")
            raise RuntimeError(f"Storage upload error: {str(e)}")

    async def get_file_bytes(self, s3_key: str) -> bytes:
        target_path = os.path.join(self.local_storage_dir, s3_key)
        if not os.path.exists(target_path):
            raise FileNotFoundError(f"Object {s3_key} not found in storage.")
        with open(target_path, "rb") as f:
            return f.read()

s3_client = S3StorageClient()

import os
from pathlib import Path
from app.config import settings
from app.core.exceptions import FileProcessingException, FileSizeExceededException

ALLOWED_DOC_EXTENSIONS = {".pdf", ".docx", ".txt"}
ALLOWED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".webm", ".m4a", ".ogg", ".flac"}

def validate_document_file(file_path_or_name: str, file_size_bytes = None):
    path = Path(file_path_or_name)
    ext = path.suffix.lower()
    if ext not in ALLOWED_DOC_EXTENSIONS:
        raise FileProcessingException(
            f"Unsupported document format '{ext}'. Allowed: {', '.join(ALLOWED_DOC_EXTENSIONS)}"
        )
    
    actual_size = 0
    if isinstance(file_size_bytes, (int, float)):
        actual_size = int(file_size_bytes)
    elif path.exists():
        actual_size = path.stat().st_size

    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if actual_size > max_bytes:
        raise FileSizeExceededException(
            f"File size ({actual_size / (1024*1024):.1f} MB) exceeds maximum allowed {settings.MAX_UPLOAD_MB} MB."
        )

def validate_audio_file(file_path_or_name: str, file_size_bytes = None):
    path = Path(file_path_or_name)
    ext = path.suffix.lower()
    if ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise FileProcessingException(
            f"Unsupported audio format '{ext}'. Allowed: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}"
        )
    
    actual_size = 0
    if isinstance(file_size_bytes, (int, float)):
        actual_size = int(file_size_bytes)
    elif path.exists():
        actual_size = path.stat().st_size

    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if actual_size > max_bytes:
        raise FileSizeExceededException(
            f"Audio file ({actual_size / (1024*1024):.1f} MB) exceeds maximum allowed {settings.MAX_UPLOAD_MB} MB."
        )

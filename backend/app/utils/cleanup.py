import os
import time
import logging
from pathlib import Path
from app.config import settings

logger = logging.getLogger("indiclingo.cleanup")

def cleanup_old_files(max_age_seconds: int = 3600) -> dict:
    """
    Purges temporary and generated files older than max_age_seconds
    to prevent disk overflow in high-throughput environments.
    """
    now = time.time()
    cleaned = {"temp": 0, "audio": 0, "documents": 0, "bytes_freed": 0}
    
    target_dirs = {
        "temp": settings.TEMP_DIR,
        "audio": settings.AUDIO_DIR,
        "documents": settings.DOC_DIR
    }
    
    for category, directory in target_dirs.items():
        if not directory.exists():
            continue
            
        for file_path in directory.iterdir():
            if file_path.is_file() and file_path.name != ".gitkeep":
                try:
                    stat = file_path.stat()
                    file_age = now - stat.st_mtime
                    if file_age > max_age_seconds:
                        size = stat.st_size
                        file_path.unlink()
                        cleaned[category] += 1
                        cleaned["bytes_freed"] += size
                        logger.debug(f"Cleaned expired file: {file_path.name} (age: {file_age:.1f}s)")
                except Exception as e:
                    logger.warning(f"Could not purge {file_path}: {e}")
                    
    return cleaned

if __name__ == "__main__":
    res = cleanup_old_files(max_age_seconds=0) # test run
    print(f"Cleanup test executed: {res}")

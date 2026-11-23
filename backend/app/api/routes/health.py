import time
import os
import psutil
from fastapi import APIRouter
from app.core.device_manager import device_manager
from app.core.model_registry import model_registry

router = APIRouter()
START_TIME = time.time()

@router.get("/health")
async def health_check():
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    
    return {
        "status": "healthy",
        "service": "IndicLingo AI Multilingual Engine",
        "version": "2.0.0",
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "device": device_manager.get_device_info(),
        "memory": {
            "rss_mb": round(memory_info.rss / (1024 * 1024), 2),
            "vms_mb": round(memory_info.vms / (1024 * 1024), 2),
        },
        "models": model_registry.get_status(),
        "supported_languages": ["en", "kn", "hi", "te", "ta", "ml"],
    }

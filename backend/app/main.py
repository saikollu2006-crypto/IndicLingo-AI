import os
import sys
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.config import settings
from app.core.logging import logger
from app.core.exceptions import IndicLingoException
from app.core.device_manager import device_manager
from app.api.api import api_router

app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    description="Multilingual Translation, Speech Recognition, Intelligent Summarization and Neural TTS API for Indic Languages",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers: primary mount under /api
app.include_router(api_router, prefix="/api")

# Also mount under root for direct root convenience (e.g. /health, /translate)
app.include_router(api_router, prefix="")

# Mount static storage for media files
app.mount("/storage/audio", StaticFiles(directory=str(settings.AUDIO_DIR)), name="audio")
app.mount("/storage/documents", StaticFiles(directory=str(settings.DOC_DIR)), name="documents")

# Global Exception Handlers
@app.exception_handler(IndicLingoException)
async def indiclingo_exception_handler(request: Request, exc: IndicLingoException):
    logger.error(f"IndicLingo domain exception on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.__class__.__name__,
            "message": exc.message,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "InternalServerError",
            "message": str(exc),
            "status_code": 500
        }
    )

@app.on_event("startup")
async def startup_event():
    logger.info("==================================================")
    logger.info(f" IndicLingo AI Engine v{settings.APP_VERSION} Starting")
    logger.info(f" Hardware: {device_manager.get_device_info()['device_name']}")
    logger.info(f" Storage: {settings.STORAGE_DIR}")
    logger.info("==================================================")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

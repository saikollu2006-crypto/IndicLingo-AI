from fastapi import APIRouter
from app.api.routes import (
    health,
    languages,
    translation,
    summarization,
    audio,
    speech,
    documents,
    jobs,
    models,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(languages.router, tags=["Languages"])
api_router.include_router(translation.router, tags=["Translation"])
api_router.include_router(summarization.router, tags=["Summarization"])
api_router.include_router(audio.router, tags=["Audio & Speech-to-Text"])
api_router.include_router(speech.router, tags=["Text-to-Speech"])
api_router.include_router(documents.router, tags=["Documents"])
api_router.include_router(jobs.router, tags=["Jobs"])
api_router.include_router(models.router, tags=["Models"])

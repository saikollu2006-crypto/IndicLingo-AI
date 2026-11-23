from fastapi import APIRouter
from app.config import SUPPORTED_LANGUAGES

router = APIRouter()

@router.get("/languages")
async def get_supported_languages():
    languages_data = []
    for code, info in SUPPORTED_LANGUAGES.items():
        languages_data.append({
            "code": code,
            "name": info["name"],
            "native_name": info.get("native_name", info["name"]),
            "script": info["script"],
            "whisper_code": info["whisper_code"],
            "edge_voice": info["edge_voice"],
            "nllb_code": info["nllb_code"],
            "capabilities": {
                "translation": True,
                "summarization": True,
                "speech_to_text": True,
                "text_to_speech": True,
                "document_processing": True,
            }
        })
    return {
        "success": True,
        "count": len(languages_data),
        "languages": languages_data
    }

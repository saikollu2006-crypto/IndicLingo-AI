from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.config import settings
from app.schemas.speech import SpeechRequest, SpeechResponse
from app.services.speech_service import speech_service
from app.core.exceptions import UnsupportedLanguageException

router = APIRouter()

@router.post("/speech/generate", response_model=SpeechResponse)
async def generate_speech(payload: SpeechRequest):
    try:
        result = await speech_service.generate_speech_async(
            text=payload.text,
            language=payload.language,
            voice=payload.voice,
            gender=payload.gender or "female"
        )
        return SpeechResponse(**result)
    except UnsupportedLanguageException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")

@router.get("/speech/file/{filename}")
async def get_audio_file(filename: str):
    # Prevent directory traversal
    clean_filename = Path(filename).name
    file_path = (settings.AUDIO_DIR / clean_filename).resolve()
    base_dir = settings.AUDIO_DIR.resolve()
    
    if not file_path.is_relative_to(base_dir) or not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Audio file not found")
        
    media_type = "audio/mpeg" if clean_filename.endswith(".mp3") else "audio/wav"
    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=clean_filename
    )

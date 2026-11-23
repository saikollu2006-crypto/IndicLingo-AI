import os
import shutil
import time
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.config import settings
from app.schemas.audio import TranscriptionResponse
from app.services.transcription_service import transcription_service
from app.utils.file_validator import validate_audio_file
from app.core.exceptions import UnsupportedLanguageException, AudioProcessingException, FileSizeExceededException, FileProcessingException

router = APIRouter()

@router.post("/audio/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    language: Optional[str] = Form(None)
):
    temp_path = settings.TEMP_DIR / f"upload_{int(time.time()*1000)}_{file.filename}"
    try:
        # Save uploaded file
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Validate file
        validate_audio_file(str(temp_path), file.filename)

        # Transcribe using Whisper
        result = transcription_service.transcribe(
            audio_path=str(temp_path),
            language=language
        )
        return TranscriptionResponse(**result)

    except FileSizeExceededException as e:
        raise HTTPException(status_code=413, detail=str(e))
    except (UnsupportedLanguageException, AudioProcessingException, FileProcessingException) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio transcription error: {str(e)}")
    finally:
        # Clean up temporary uploaded file
        if temp_path.exists():
            try:
                os.remove(temp_path)
            except Exception:
                pass

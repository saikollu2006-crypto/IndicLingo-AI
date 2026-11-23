import os
import time
from pathlib import Path
from typing import Dict, Any, Optional
from app.config import settings, SUPPORTED_LANGUAGES
from app.core.model_registry import model_registry
from app.core.exceptions import AudioProcessingException, UnsupportedLanguageException
from app.utils.audio_processor import convert_audio_to_wav, get_audio_duration
from app.core.logging import logger

class TranscriptionService:
    """Multilingual Speech-to-Text Transcription Service using OpenAI Whisper."""

    def transcribe(
        self,
        audio_path: str,
        language: Optional[str] = None
    ) -> Dict[str, Any]:
        start_time = time.time()

        if language and language != "auto" and language not in SUPPORTED_LANGUAGES:
            raise UnsupportedLanguageException(language)

        # Convert input audio (e.g. WebM, MP3, etc.) to 16kHz WAV
        temp_wav = str(settings.TEMP_DIR / f"temp_{int(time.time()*1000)}.wav")
        try:
            converted_path = convert_audio_to_wav(audio_path, temp_wav)
            duration = get_audio_duration(converted_path)
            
            whisper_model = model_registry.get_asr_model()

            options = {
                "task": "transcribe",
                "fp16": False,  # CPU safe execution
            }

            if language and language != "auto":
                whisper_lang = SUPPORTED_LANGUAGES[language]["whisper_code"]
                options["language"] = whisper_lang

            result = whisper_model.transcribe(converted_path, **options)

            transcript = result.get("text", "").strip()
            detected_lang = result.get("language", language or "en")
            
            # Map detected language back to 2-letter code if needed
            detected_code = detected_lang if detected_lang in SUPPORTED_LANGUAGES else "en"

            segments = [
                {
                    "start": round(seg.get("start", 0.0), 2),
                    "end": round(seg.get("end", 0.0), 2),
                    "text": seg.get("text", "").strip()
                }
                for seg in result.get("segments", [])
            ]

            execution_time_ms = round((time.time() - start_time) * 1000, 2)

            return {
                "transcript": transcript,
                "detected_language": detected_code,
                "duration_seconds": round(duration, 2),
                "model": f"openai-whisper-{settings.WHISPER_MODEL_SIZE}",
                "segments": segments,
                "execution_time_ms": execution_time_ms,
            }

        except Exception as e:
            logger.error(f"Speech recognition failed: {e}")
            raise AudioProcessingException(str(e))
        finally:
            if os.path.exists(temp_wav):
                try:
                    os.remove(temp_wav)
                except Exception:
                    pass

transcription_service = TranscriptionService()

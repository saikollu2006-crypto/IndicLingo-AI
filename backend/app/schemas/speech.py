from typing import Optional, Any
from pydantic import BaseModel, Field, model_validator

class SpeechRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Text to convert to speech")
    language: str = Field("en", description="Language code (en, kn, hi, te, ta, ml)")
    voice: Optional[str] = Field(None, description="Voice identifier")
    gender: Optional[str] = Field("female", description="Voice gender: female or male")

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, values: Any):
        if isinstance(values, dict):
            if "lang" in values and "language" not in values:
                values["language"] = values["lang"]
            elif "language_code" in values and "language" not in values:
                values["language"] = values["language_code"]
        return values

class SpeechResponse(BaseModel):
    success: bool = True
    audio_url: str
    audio_format: str
    language: str
    voice: str
    file_size_bytes: int
    duration_estimate_sec: float

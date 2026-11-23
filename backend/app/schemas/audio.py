from typing import Optional, List
from pydantic import BaseModel, model_validator

class TranscriptionResponse(BaseModel):
    success: bool = True
    transcript: str
    text: Optional[str] = None  # Frontend convenience alias
    detected_language: str
    language_confidence: Optional[float] = None
    duration_seconds: float
    model: str
    segments: Optional[List[dict]] = None
    execution_time_ms: float

    @model_validator(mode="after")
    def sync_aliases(self):
        if self.text is None:
            self.text = self.transcript
        return self

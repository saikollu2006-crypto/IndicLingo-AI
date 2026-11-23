from typing import Optional
from pydantic import BaseModel, Field, model_validator

class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=50000, description="Source text to translate")
    source_language: str = Field("en", description="Source language code (en, kn, hi, te, ta, ml)")
    target_language: str = Field("en", description="Target language code (en, kn, hi, te, ta, ml)")

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, values):
        if isinstance(values, dict):
            # Support source_lang as alias
            if "source_lang" in values and "source_language" not in values:
                values["source_language"] = values["source_lang"]
            # Support target_lang as alias
            if "target_lang" in values and "target_language" not in values:
                values["target_language"] = values["target_lang"]
        return values

class TranslationResponse(BaseModel):
    success: bool = True
    source_language: str
    target_language: str
    translated_text: str
    model: str
    char_count: int
    execution_time_ms: float

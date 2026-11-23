from typing import Optional, Literal, List, Any
from pydantic import BaseModel, Field, model_validator

class SummarizationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=100000, description="Content to summarize")
    source_language: str = Field("en", description="Language of the input text")
    summary_language: str = Field("en", description="Target language for the generated summary")
    summary_length: Literal["short", "medium", "detailed"] = Field("medium", description="Length tier")
    format: Literal["paragraph", "bullets", "bullet"] = Field("paragraph", description="Layout format")

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, values: Any):
        if isinstance(values, dict):
            if "source_lang" in values and "source_language" not in values:
                values["source_language"] = values["source_lang"]
            if "target_lang" in values and "summary_language" not in values:
                values["summary_language"] = values["target_lang"]
            elif "target_language" in values and "summary_language" not in values:
                values["summary_language"] = values["target_language"]
            if "length" in values and "summary_length" not in values:
                values["summary_length"] = values["length"]
            if values.get("format") == "bullet":
                values["format"] = "bullets"
        return values

class SummarizationResponse(BaseModel):
    success: bool = True
    summary: str
    bullet_points: Optional[List[str]] = None
    source_language: str
    summary_language: str
    method: str
    original_char_count: int
    summary_char_count: int
    compression_ratio: float
    execution_time_ms: float

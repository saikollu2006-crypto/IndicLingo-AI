from typing import Optional, List, Any
from pydantic import BaseModel, Field, model_validator

class DocumentExtractionResponse(BaseModel):
    success: bool = True
    file_name: str
    file_type: str
    page_count: int
    char_count: int
    extracted_text: str
    text: Optional[str] = None  # Frontend convenience alias
    pages: Optional[int] = None # Frontend convenience alias
    is_scanned: bool = False
    ocr_applied: bool = False
    language_hint: Optional[str] = None
    execution_time_ms: float

    @model_validator(mode="after")
    def sync_aliases(self):
        if self.text is None:
            self.text = self.extracted_text
        if self.pages is None:
            self.pages = self.page_count
        return self

class DocumentTranslateRequest(BaseModel):
    text: str = Field(..., min_length=1)
    source_language: str = "en"
    target_language: str = "en"
    file_name: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, values: Any):
        if isinstance(values, dict):
            if "source_lang" in values and "source_language" not in values:
                values["source_language"] = values["source_lang"]
            if "target_lang" in values and "target_language" not in values:
                values["target_language"] = values["target_lang"]
        return values

class DocumentSummarizeRequest(BaseModel):
    text: str = Field(..., min_length=1)
    source_language: str = "en"
    summary_language: str = "en"
    summary_length: str = "medium"
    format: str = "paragraph"

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, values: Any):
        if isinstance(values, dict):
            if "source_lang" in values and "source_language" not in values:
                values["source_language"] = values["source_lang"]
            if "target_lang" in values and "summary_language" not in values:
                values["summary_language"] = values["target_lang"]
            if "length" in values and "summary_length" not in values:
                values["summary_length"] = values["length"]
            if values.get("format") == "bullet":
                values["format"] = "bullets"
        return values

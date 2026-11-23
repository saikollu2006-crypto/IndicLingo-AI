import os
import shutil
import time
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from app.config import settings
from app.schemas.document import (
    DocumentExtractionResponse,
    DocumentTranslateRequest,
    DocumentSummarizeRequest
)
from app.services.document_service import document_service
from app.services.translation_service import translation_service
from app.services.summarization_service import summarization_service
from app.utils.file_validator import validate_document_file
from app.core.exceptions import FileProcessingException, FileSizeExceededException, UnsupportedLanguageException

router = APIRouter()

class DocumentExportRequest(BaseModel):
    text: str = Field(..., min_length=1)
    format: str = Field("txt", description="'txt' or 'docx'")
    filename: Optional[str] = None

@router.post("/documents/extract", response_model=DocumentExtractionResponse)
async def extract_document(file: UploadFile = File(...)):
    temp_path = settings.TEMP_DIR / f"doc_{int(time.time()*1000)}_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        validate_document_file(str(temp_path), file.filename)

        result = document_service.process_document(
            file_path=str(temp_path),
            original_filename=file.filename
        )
        return DocumentExtractionResponse(**result)

    except FileSizeExceededException as e:
        raise HTTPException(status_code=413, detail=str(e))
    except FileProcessingException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document extraction error: {str(e)}")
    finally:
        if temp_path.exists():
            try:
                os.remove(temp_path)
            except Exception:
                pass

@router.post("/documents/translate")
async def translate_document(payload: DocumentTranslateRequest):
    try:
        result = translation_service.translate(
            text=payload.text,
            source_lang=payload.source_language,
            target_lang=payload.target_language
        )
        return {
            "success": True,
            "translated_text": result["translated_text"],
            "source_language": result["source_language"],
            "target_language": result["target_language"],
            "char_count": result["char_count"],
            "execution_time_ms": result["execution_time_ms"]
        }
    except UnsupportedLanguageException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document translation failed: {str(e)}")

@router.post("/documents/summarize")
async def summarize_document(payload: DocumentSummarizeRequest):
    try:
        result = summarization_service.summarize(
            text=payload.text,
            source_lang=payload.source_language,
            summary_lang=payload.summary_language,
            length=payload.summary_length,
            format_type=payload.format
        )
        return {
            "success": True,
            "summary": result["summary"],
            "bullet_points": result.get("bullet_points"),
            "compression_ratio": result["compression_ratio"],
            "execution_time_ms": result["execution_time_ms"]
        }
    except UnsupportedLanguageException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document summarization failed: {str(e)}")

@router.post("/documents/export")
async def export_document(payload: DocumentExportRequest):
    try:
        fmt = "docx" if payload.format.lower() == "docx" else "txt"
        exported_filename = document_service.export_text_as_file(payload.text, format_type=fmt)
        return {
            "success": True,
            "filename": exported_filename,
            "download_url": f"/api/documents/download/{exported_filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.get("/documents/download/{filename}")
async def download_exported_document(filename: str):
    clean_name = Path(filename).name
    file_path = (settings.DOC_DIR / clean_name).resolve()
    base_dir = settings.DOC_DIR.resolve()

    if not file_path.is_relative_to(base_dir) or not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Requested export file not found")
        
    media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document" if clean_name.endswith(".docx") else "text/plain; charset=utf-8"
    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=clean_name
    )

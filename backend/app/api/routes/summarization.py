from fastapi import APIRouter, HTTPException
from app.schemas.summarization import SummarizationRequest, SummarizationResponse
from app.services.summarization_service import summarization_service
from app.core.exceptions import UnsupportedLanguageException, IndicLingoException

router = APIRouter()

@router.post("/summarize", response_model=SummarizationResponse)
async def summarize_text(payload: SummarizationRequest):
    try:
        result = summarization_service.summarize(
            text=payload.text,
            source_lang=payload.source_language,
            summary_lang=payload.summary_language,
            length=payload.summary_length,
            format_type=payload.format
        )
        return SummarizationResponse(**result)
    except UnsupportedLanguageException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IndicLingoException as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

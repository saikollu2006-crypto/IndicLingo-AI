from fastapi import APIRouter, HTTPException
from app.schemas.translation import TranslationRequest, TranslationResponse
from app.services.translation_service import translation_service
from app.core.exceptions import UnsupportedLanguageException, IndicLingoException

router = APIRouter()

@router.post("/translate", response_model=TranslationResponse)
async def translate_text(payload: TranslationRequest):
    try:
        result = translation_service.translate(
            text=payload.text,
            source_lang=payload.source_language,
            target_lang=payload.target_language
        )
        return TranslationResponse(**result)
    except UnsupportedLanguageException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IndicLingoException as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

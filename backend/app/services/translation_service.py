import time
import torch
from typing import Dict, Any, List
from app.config import SUPPORTED_LANGUAGES, settings
from app.core.model_registry import model_registry
from app.core.exceptions import UnsupportedLanguageException, IndicLingoException
from app.core.logging import logger
from app.utils.text_cleaner import normalize_text
from app.utils.chunking import chunk_text
from app.core.device_manager import device_manager

class TranslationService:
    """Core Neural Machine Translation service powered by NLLB-200."""

    @staticmethod
    def validate_language(lang_code: str):
        if lang_code not in SUPPORTED_LANGUAGES:
            raise UnsupportedLanguageException(lang_code)

    def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        self.validate_language(source_lang)
        self.validate_language(target_lang)

        cleaned_text = normalize_text(text)
        if not cleaned_text:
            return {
                "translated_text": "",
                "source_language": source_lang,
                "target_language": target_lang,
                "model": settings.NLLB_MODEL_ID,
                "char_count": 0,
                "execution_time_ms": 0.0,
            }

        # If identical language, return text directly
        if source_lang == target_lang:
            return {
                "translated_text": cleaned_text,
                "source_language": source_lang,
                "target_language": target_lang,
                "model": "identity_passthrough",
                "char_count": len(cleaned_text),
                "execution_time_ms": round((time.time() - start_time) * 1000, 2),
            }

        src_nllb = SUPPORTED_LANGUAGES[source_lang]["nllb_code"]
        tgt_nllb = SUPPORTED_LANGUAGES[target_lang]["nllb_code"]

        # Chunk text if long to prevent token overflow
        chunks = chunk_text(cleaned_text, max_chunk_chars=800)
        translated_chunks: List[str] = []

        model, tokenizer = model_registry.get_translation_model()
        device = device_manager.get_device()
        tgt_lang_id = tokenizer.convert_tokens_to_ids(tgt_nllb)

        with torch.no_grad():
            for chunk in chunks:
                tokenizer.src_lang = src_nllb
                inputs = tokenizer(
                    chunk,
                    return_tensors="pt",
                    padding=True,
                    truncation=True,
                    max_length=512,
                ).to(device)

                generated_tokens = model.generate(
                    **inputs,
                    forced_bos_token_id=tgt_lang_id,
                    max_new_tokens=512,
                    num_beams=2,
                    early_stopping=True,
                )

                decoded = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
                translated_chunks.append(decoded.strip())

        final_translated_text = " ".join(translated_chunks)
        execution_time_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "translated_text": final_translated_text,
            "source_language": source_lang,
            "target_language": target_lang,
            "model": settings.NLLB_MODEL_ID,
            "char_count": len(final_translated_text),
            "execution_time_ms": execution_time_ms,
        }

translation_service = TranslationService()

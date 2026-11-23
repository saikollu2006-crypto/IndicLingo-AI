import shutil
from typing import Optional, List
from PIL import Image
import pytesseract
from app.config import SUPPORTED_LANGUAGES
from app.core.logging import logger

class OCRService:
    """OCR Engine handling scanned documents and images across Indian scripts."""

    def __init__(self):
        self.tesseract_available = bool(shutil.which("tesseract"))
        self.available_langs: List[str] = []
        if self.tesseract_available:
            try:
                self.available_langs = pytesseract.get_languages()
            except Exception:
                self.available_langs = ["eng"]

    def is_available(self) -> bool:
        return self.tesseract_available

    def get_supported_ocr_languages(self) -> List[str]:
        return self.available_langs

    def perform_ocr(self, image: Image.Image, language: str = "en") -> str:
        if not self.tesseract_available:
            return ""

        tess_code = SUPPORTED_LANGUAGES.get(language, {}).get("tesseract_code", "eng")
        
        # Check if language pack is installed, fallback to eng or all available
        if tess_code not in self.available_langs:
            if "eng" in self.available_langs:
                tess_code = "eng"
            elif self.available_langs:
                tess_code = self.available_langs[0]
            else:
                return ""

        try:
            text = pytesseract.image_to_string(image, lang=tess_code)
            return text.strip()
        except Exception as e:
            logger.warning(f"Tesseract OCR failed: {e}")
            return ""

ocr_service = OCRService()

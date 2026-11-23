import re
from typing import Tuple, Dict
from app.config import SUPPORTED_LANGUAGES

UNICODE_RANGES: Dict[str, Tuple[int, int]] = {
    "kn": (0x0C80, 0x0CFF),  # Kannada
    "hi": (0x0900, 0x097F),  # Devanagari (Hindi)
    "te": (0x0C00, 0x0C7F),  # Telugu
    "ta": (0x0B80, 0x0BFF),  # Tamil
    "ml": (0x0D00, 0x0D7F),  # Malayalam
}

class LanguageDetectionService:
    """Accurately detects source language across the 6 supported languages."""

    @staticmethod
    def detect_language(text: str) -> Tuple[str, float]:
        if not text or not text.strip():
            return "en", 0.0

        counts = {code: 0 for code in SUPPORTED_LANGUAGES}
        total_letters = 0

        for char in text:
            cp = ord(char)
            # Check Indian scripts
            matched = False
            for lang, (start, end) in UNICODE_RANGES.items():
                if start <= cp <= end:
                    counts[lang] += 1
                    total_letters += 1
                    matched = True
                    break
            if not matched and (('A' <= char <= 'Z') or ('a' <= char <= 'z')):
                counts["en"] += 1
                total_letters += 1

        if total_letters == 0:
            return "en", 0.5

        top_lang = max(counts, key=counts.get)
        confidence = round(counts[top_lang] / total_letters, 3)

        # If very few letters matched, default to English with lower confidence
        if counts[top_lang] == 0:
            return "en", 0.5

        return top_lang, confidence

language_detection_service = LanguageDetectionService()

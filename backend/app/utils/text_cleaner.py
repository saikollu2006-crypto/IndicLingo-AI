import re
import unicodedata
from typing import List

# Indic sentence end markers: danda (। U+0964), double danda (॥ U+0965), standard punctuation
SENTENCE_SPLIT_REGEX = re.compile(r'(?<=[।॥.?!])\s+')

def normalize_text(text: str) -> str:
    """Normalizes Unicode characters, especially conjuncts and diacritics in Indian scripts."""
    if not text:
        return ""
    # NFC normalization preserves composite Indian characters
    text = unicodedata.normalize('NFC', text)
    # Normalize varied whitespace
    text = re.sub(r'[\r\t\f\v ]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def split_into_sentences(text: str) -> List[str]:
    """Splits text into sentences respecting both Latin and Indic sentence boundaries."""
    normalized = normalize_text(text)
    if not normalized:
        return []
    
    # Split by double newlines (paragraphs) first
    paragraphs = normalized.split('\n\n')
    sentences = []
    
    for p in paragraphs:
        p_clean = p.strip()
        if not p_clean:
            continue
        # Split paragraph into sentences
        parts = SENTENCE_SPLIT_REGEX.split(p_clean)
        for part in parts:
            s = part.strip()
            if s:
                sentences.append(s)
                
    return sentences

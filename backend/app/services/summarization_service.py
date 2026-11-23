import time
import math
import re
from typing import Dict, Any, List, Tuple
from collections import Counter
from app.config import SUPPORTED_LANGUAGES
from app.utils.text_cleaner import split_into_sentences, normalize_text
from app.services.translation_service import translation_service
from app.core.exceptions import UnsupportedLanguageException

class SummarizationService:
    """
    Intelligent Summarization Engine providing factual, grounded summaries
    across Short, Medium, and Detailed lengths with Paragraph or Bullet layouts,
    and automatic cross-lingual translation.
    """

    @staticmethod
    def _calculate_sentence_scores(sentences: List[str]) -> List[Tuple[int, str, float]]:
        """
        Computes salience scores for sentences using term frequencies,
        sentence position weighting, and length normalization.
        """
        # Tokenize words across scripts
        words_per_sentence = []
        all_words = []
        for s in sentences:
            tokens = re.findall(r'\b\w+\b', s.lower())
            words_per_sentence.append(tokens)
            all_words.extend(tokens)

        if not all_words:
            return [(i, s, 1.0) for i, s in enumerate(sentences)]

        word_freq = Counter(all_words)
        max_freq = max(word_freq.values()) or 1
        normalized_freq = {w: count / max_freq for w, count in word_freq.items()}

        scored = []
        n = len(sentences)

        for idx, (sentence, tokens) in enumerate(zip(sentences, words_per_sentence)):
            if not tokens:
                scored.append((idx, sentence, 0.0))
                continue

            # Term frequency score
            tf_score = sum(normalized_freq.get(t, 0) for t in tokens) / math.sqrt(len(tokens))

            # Position weight (lead sentences in paragraphs carry higher informative density)
            position_weight = 1.25 if idx == 0 else (1.1 if idx < 3 else (1.05 if idx == n - 1 else 1.0))
            
            # Sentence length penalty for excessively short phrases (< 4 words)
            length_factor = 1.0 if len(tokens) >= 5 else 0.5

            final_score = tf_score * position_weight * length_factor
            scored.append((idx, sentence, final_score))

        return scored

    def summarize(
        self,
        text: str,
        source_lang: str = "en",
        summary_lang: str = "en",
        length: str = "medium",
        format_type: str = "paragraph"
    ) -> Dict[str, Any]:
        start_time = time.time()

        if source_lang not in SUPPORTED_LANGUAGES:
            raise UnsupportedLanguageException(source_lang)
        if summary_lang not in SUPPORTED_LANGUAGES:
            raise UnsupportedLanguageException(summary_lang)

        cleaned_text = normalize_text(text)
        if not cleaned_text:
            return {
                "summary": "",
                "bullet_points": [],
                "source_language": source_lang,
                "summary_language": summary_lang,
                "method": "extractive_salience_ranking",
                "original_char_count": 0,
                "summary_char_count": 0,
                "compression_ratio": 0.0,
                "execution_time_ms": 0.0,
            }

        raw_sentences = split_into_sentences(cleaned_text)
        # Deduplicate sentences while preserving narrative order
        seen_sentences = set()
        sentences = []
        for s in raw_sentences:
            norm_s = s.strip().lower()
            if norm_s and norm_s not in seen_sentences:
                seen_sentences.add(norm_s)
                sentences.append(s)

        # If text is already very short, use it directly
        if len(sentences) <= 2:
            chosen_sentences = sentences
        else:
            scored = self._calculate_sentence_scores(sentences)

            # Determine extraction ratio
            if length == "short":
                count = max(1, min(3, math.ceil(len(sentences) * 0.25)))
            elif length == "detailed":
                count = max(3, min(12, math.ceil(len(sentences) * 0.65)))
            else:  # medium
                count = max(2, min(6, math.ceil(len(sentences) * 0.40)))

            # Sort by score descending to pick top sentences
            top_scored = sorted(scored, key=lambda x: x[2], reverse=True)[:count]
            # Re-sort selected sentences by original document order to preserve narrative flow
            ordered_selection = sorted(top_scored, key=lambda x: x[0])
            chosen_sentences = [item[1] for item in ordered_selection]

        # Check if cross-lingual translation of summary is required
        if summary_lang != source_lang:
            translated_sentences = []
            for s in chosen_sentences:
                res = translation_service.translate(s, source_lang, summary_lang)
                translated_sentences.append(res["translated_text"])
            chosen_sentences = translated_sentences
            method_desc = f"Extractive Salience Ranking + NLLB-200 Cross-Lingual Pivot ({source_lang} -> {summary_lang})"
        else:
            method_desc = "Factual Extractive Salience Ranking (Source Grounded)"

        # Format output
        if format_type == "bullets":
            bullet_points = [f"• {s}" for s in chosen_sentences]
            final_summary = "\n".join(bullet_points)
        else:
            bullet_points = [f"• {s}" for s in chosen_sentences]
            final_summary = " ".join(chosen_sentences)

        orig_len = len(cleaned_text)
        sum_len = len(final_summary)
        compression = round((1 - (sum_len / max(1, orig_len))) * 100, 1)

        return {
            "summary": final_summary,
            "bullet_points": [s for s in chosen_sentences],
            "source_language": source_lang,
            "summary_language": summary_lang,
            "method": method_desc,
            "original_char_count": orig_len,
            "summary_char_count": sum_len,
            "compression_ratio": max(0.0, compression),
            "execution_time_ms": round((time.time() - start_time) * 1000, 2),
        }

summarization_service = SummarizationService()

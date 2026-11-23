from typing import List
from app.utils.text_cleaner import split_into_sentences

def chunk_text(text: str, max_chunk_chars: int = 1200) -> List[str]:
    """
    Chunks text by sentence boundaries so sentences are never cut in half.
    Ensures long documents fit smoothly within translation and summarization model contexts.
    """
    sentences = split_into_sentences(text)
    if not sentences:
        return []

    chunks: List[str] = []
    current_chunk: List[str] = []
    current_length = 0

    for sentence in sentences:
        s_len = len(sentence)
        if current_length + s_len + 1 > max_chunk_chars and current_chunk:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]
            current_length = s_len
        else:
            current_chunk.append(sentence)
            current_length += s_len + 1

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

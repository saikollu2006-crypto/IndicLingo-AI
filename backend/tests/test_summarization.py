import pytest

SAMPLE_TEXT = (
    "IndicLingo AI is an advanced multilingual translation and summarization platform. "
    "It empowers users across India to bridge regional language gaps effortlessly. "
    "The system supports six distinct languages including Kannada, Hindi, Telugu, Tamil, Malayalam, and English. "
    "Users can enter text, record live audio, or upload documents to get fast, accurate translations. "
    "High-fidelity neural text-to-speech enables natural listening to all translated content."
)

@pytest.mark.asyncio
async def test_summarization_paragraphs(client):
    response = await client.post("/api/summarize", json={
        "text": SAMPLE_TEXT,
        "source_lang": "en",
        "target_lang": "en",
        "length": "short",
        "format": "paragraph"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["summary"]) > 0
    assert data["summary_char_count"] < len(SAMPLE_TEXT)

@pytest.mark.asyncio
async def test_summarization_bullets(client):
    response = await client.post("/api/summarize", json={
        "text": SAMPLE_TEXT,
        "source_lang": "en",
        "target_lang": "en",
        "length": "medium",
        "format": "bullets"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "•" in data["summary"]

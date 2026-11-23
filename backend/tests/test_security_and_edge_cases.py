import pytest
import io
from app.utils.cleanup import cleanup_old_files
from app.utils.chunking import chunk_text
from app.services.translation_service import translation_service

@pytest.mark.asyncio
async def test_path_traversal_speech(client):
    """Ensure directory traversal attacks on speech files are blocked."""
    response = await client.get("/api/speech/file/..%2F..%2F..%2Fboot.ini")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_path_traversal_documents(client):
    """Ensure directory traversal attacks on document download are blocked."""
    response = await client.get("/api/documents/download/..%2F..%2F..%2Fboot.ini")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_empty_translation_rejection(client):
    """Empty translation request should fail validation (HTTP 422)."""
    response = await client.post("/api/translate", json={
        "text": "",
        "source_lang": "en",
        "target_lang": "te"
    })
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_audio_empty_file_rejection(client):
    """0-byte audio upload must be rejected cleanly with HTTP 400."""
    files = {"file": ("empty.wav", b"", "audio/wav")}
    response = await client.post("/api/audio/transcribe", files=files, data={"language": "en"})
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_audio_unsupported_format_rejection(client):
    """Unsupported audio format must be rejected with HTTP 400."""
    files = {"file": ("payload.exe", b"MZDummyPayloadContent", "application/octet-stream")}
    response = await client.post("/api/audio/transcribe", files=files, data={"language": "en"})
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_document_unsupported_format_rejection(client):
    """Unsupported document format must be rejected with HTTP 400."""
    files = {"file": ("payload.exe", b"MZExecutableBinary", "application/octet-stream")}
    response = await client.post("/api/documents/extract", files=files)
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_summarizer_deduplication(client):
    """Summarizer must deduplicate identical repeated sentences."""
    repetitive_text = (
        "Bangalore is the silicon valley of India. "
        "Bangalore is the silicon valley of India. "
        "It is famous for technological development and parks. "
        "Bangalore is the silicon valley of India. "
        "The city has an enjoyable climate throughout the year."
    )
    response = await client.post("/api/summarize", json={
        "text": repetitive_text,
        "source_lang": "en",
        "target_lang": "en",
        "length": "medium",
        "format": "paragraph"
    })
    assert response.status_code == 200
    summary = response.json()["summary"]
    # Check that the repeated sentence appears only once
    assert summary.count("Bangalore is the silicon valley of India") == 1

def test_translation_chunking_utility():
    """Verify that sentence chunking correctly divides large texts without breaking words."""
    long_text = "This is a sentence. " * 50
    chunks = chunk_text(long_text, max_chunk_chars=200)
    assert len(chunks) > 1
    recombined = " ".join(chunks)
    assert "This is a sentence." in recombined

def test_storage_cleanup_utility():
    """Test that cleanup utility executes safely."""
    res = cleanup_old_files(max_age_seconds=86400)
    assert isinstance(res, dict)
    assert "bytes_freed" in res

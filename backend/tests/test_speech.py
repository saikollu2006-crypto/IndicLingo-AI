import pytest

@pytest.mark.asyncio
async def test_speech_generation_and_streaming(client):
    # 1. Generate speech
    response = await client.post("/api/speech/generate", json={
        "text": "Namaskara, welcome to IndicLingo AI",
        "language": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "audio_url" in data
    
    # 2. Fetch generated audio file
    audio_url = data["audio_url"]
    file_resp = await client.get(audio_url)
    assert file_resp.status_code == 200
    assert len(file_resp.content) > 500

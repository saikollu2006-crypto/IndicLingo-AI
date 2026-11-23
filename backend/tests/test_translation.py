import pytest

@pytest.mark.asyncio
async def test_translation_identity(client):
    response = await client.post("/api/translate", json={
        "text": "Hello, welcome to IndicLingo AI.",
        "source_lang": "en",
        "target_lang": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["translated_text"] == "Hello, welcome to IndicLingo AI."
    assert data["model"] == "identity_passthrough"

@pytest.mark.asyncio
async def test_translation_unsupported_language(client):
    response = await client.post("/api/translate", json={
        "text": "Hello",
        "source_lang": "xx",
        "target_lang": "en"
    })
    assert response.status_code in [400, 422]

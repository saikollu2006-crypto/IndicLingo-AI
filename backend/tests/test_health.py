import pytest

@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "device" in data
    assert len(data["supported_languages"]) == 6
    assert "en" in data["supported_languages"]
    assert "kn" in data["supported_languages"]
    assert "hi" in data["supported_languages"]
    assert "te" in data["supported_languages"]
    assert "ta" in data["supported_languages"]
    assert "ml" in data["supported_languages"]

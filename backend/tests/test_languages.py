import pytest

@pytest.mark.asyncio
async def test_supported_languages(client):
    response = await client.get("/api/languages")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] == 6
    
    codes = {l["code"] for l in data["languages"]}
    expected = {"en", "kn", "hi", "te", "ta", "ml"}
    assert codes == expected
    
    for lang in data["languages"]:
        assert "name" in lang
        assert "native_name" in lang
        assert "script" in lang
        assert lang["capabilities"]["translation"] is True
        assert lang["capabilities"]["summarization"] is True

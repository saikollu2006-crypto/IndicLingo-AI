import pytest

@pytest.mark.asyncio
async def test_document_extraction(client):
    content = b"IndicLingo AI multilingual document processing test file."
    files = {"file": ("test_doc.txt", content, "text/plain")}
    response = await client.post("/api/documents/extract", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "IndicLingo AI" in data["extracted_text"]

@pytest.mark.asyncio
async def test_document_export_and_download(client):
    # 1. Export as TXT
    res_txt = await client.post("/api/documents/export", json={
        "text": "Exported translation test content",
        "format": "txt"
    })
    assert res_txt.status_code == 200
    dl_url = res_txt.json()["download_url"]
    
    # 2. Download TXT
    get_txt = await client.get(dl_url)
    assert get_txt.status_code == 200
    assert b"Exported translation test content" in get_txt.content

    # 3. Export as DOCX
    res_docx = await client.post("/api/documents/export", json={
        "text": "Exported docx translation test content",
        "format": "docx"
    })
    assert res_docx.status_code == 200
    dl_docx_url = res_docx.json()["download_url"]

    # 4. Download DOCX
    get_docx = await client.get(dl_docx_url)
    assert get_docx.status_code == 200
    assert len(get_docx.content) > 1000

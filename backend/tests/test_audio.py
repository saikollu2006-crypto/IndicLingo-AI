import pytest
import wave
import struct
import io

@pytest.mark.asyncio
async def test_audio_transcription(client):
    # Create an in-memory 1-second WAV file
    wav_io = io.BytesIO()
    with wave.open(wav_io, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(16000)
        for _ in range(16000):
            wav.writeframesraw(struct.pack("<h", 0))
    wav_bytes = wav_io.getvalue()

    files = {"file": ("test_silence.wav", wav_bytes, "audio/wav")}
    data = {"language": "en"}
    response = await client.post("/api/audio/transcribe", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["model"] == "openai-whisper-tiny"
    assert res_data["duration_seconds"] == 1.0

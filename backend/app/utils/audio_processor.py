import os
import subprocess
from pathlib import Path
import soundfile as sf
from app.core.exceptions import AudioProcessingException
from app.core.logging import logger

def convert_audio_to_wav(input_path: str, output_path: str) -> str:
    """
    Converts any input audio file (WebM, MP3, M4A, etc.) into 16kHz mono WAV for Whisper.
    Uses imageio-ffmpeg bundled binary.
    """
    try:
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        ffmpeg_exe = "ffmpeg"

    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", str(input_path),
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        str(output_path)
    ]

    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        return output_path
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg conversion error: {e.stderr.decode('utf-8', errors='ignore')}")
        raise AudioProcessingException(f"Failed to process audio recording: {e.stderr.decode('utf-8', errors='ignore')[:200]}")

def get_audio_duration(file_path: str) -> float:
    """Calculates duration in seconds using soundfile."""
    try:
        info = sf.info(file_path)
        return float(info.duration)
    except Exception:
        return 0.0

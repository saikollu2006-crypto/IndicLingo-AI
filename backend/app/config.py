import os
from pathlib import Path
from typing import Dict, List
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "IndicLingo AI Backend")
    APP_TITLE: str = "IndicLingo AI Multilingual Translation and Summarization API"
    VERSION: str = "2.0.0"
    APP_VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    # Storage Paths
    STORAGE_DIR: Path = BASE_DIR / "storage"
    UPLOAD_DIR: Path = BASE_DIR / "storage" / "uploads"
    AUDIO_DIR: Path = BASE_DIR / "storage" / "generated_audio"
    DOC_DIR: Path = BASE_DIR / "storage" / "documents"
    TEMP_DIR: Path = BASE_DIR / "storage" / "temp"

    # Hardware & Model Settings
    DEVICE: str = os.getenv("DEVICE", "auto")  # "auto", "cpu", "cuda"
    NLLB_MODEL_ID: str = os.getenv("NLLB_MODEL_ID", "facebook/nllb-200-distilled-600M")
    WHISPER_MODEL_SIZE: str = os.getenv("WHISPER_MODEL_SIZE", "tiny")  # "tiny", "base", "small"
    TTS_PROVIDER: str = os.getenv("TTS_PROVIDER", "edge_tts")  # "edge_tts" or "gtts"
    
    # Limits
    MAX_INPUT_CHARS: int = int(os.getenv("MAX_INPUT_CHARS", "10000"))
    MAX_UPLOAD_MB: int = int(os.getenv("MAX_UPLOAD_MB", "25"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/storage/indiclingo.db")

settings = Settings()

# Ensure storage directories exist
for folder in [settings.STORAGE_DIR, settings.UPLOAD_DIR, settings.AUDIO_DIR, settings.DOC_DIR, settings.TEMP_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

# Register imageio-ffmpeg directory in PATH if available
try:
    import imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    ffmpeg_dir = str(Path(ffmpeg_exe).parent)
    if ffmpeg_dir not in os.environ.get("PATH", ""):
        os.environ["PATH"] = f"{ffmpeg_dir};{os.environ.get('PATH', '')}"
except Exception:
    pass

# Language Registry for 6 Indian Languages
SUPPORTED_LANGUAGES: Dict[str, Dict[str, str]] = {
    "en": {
        "name": "English",
        "native_name": "English",
        "script": "Latin",
        "nllb_code": "eng_Latn",
        "whisper_code": "en",
        "edge_voice": "en-IN-NeerjaNeural",
        "edge_voice_male": "en-IN-PrabhatNeural",
        "gtts_code": "en",
        "tesseract_code": "eng",
    },
    "kn": {
        "name": "Kannada",
        "native_name": "ಕನ್ನಡ",
        "script": "Kannada",
        "nllb_code": "kan_Knda",
        "whisper_code": "kn",
        "edge_voice": "kn-IN-SapnaNeural",
        "edge_voice_male": "kn-IN-GaganNeural",
        "gtts_code": "kn",
        "tesseract_code": "kan",
    },
    "hi": {
        "name": "Hindi",
        "native_name": "हिन्दी",
        "script": "Devanagari",
        "nllb_code": "hin_Deva",
        "whisper_code": "hi",
        "edge_voice": "hi-IN-SwaraNeural",
        "edge_voice_male": "hi-IN-MadhurNeural",
        "gtts_code": "hi",
        "tesseract_code": "hin",
    },
    "te": {
        "name": "Telugu",
        "native_name": "తెలుగు",
        "script": "Telugu",
        "nllb_code": "tel_Telu",
        "whisper_code": "te",
        "edge_voice": "te-IN-ShrutiNeural",
        "edge_voice_male": "te-IN-MohanNeural",
        "gtts_code": "te",
        "tesseract_code": "tel",
    },
    "ta": {
        "name": "Tamil",
        "native_name": "தமிழ்",
        "script": "Tamil",
        "nllb_code": "tam_Taml",
        "whisper_code": "ta",
        "edge_voice": "ta-IN-PallaviNeural",
        "edge_voice_male": "ta-IN-ValluvarNeural",
        "gtts_code": "ta",
        "tesseract_code": "tam",
    },
    "ml": {
        "name": "Malayalam",
        "native_name": "മലയാളം",
        "script": "Malayalam",
        "nllb_code": "mal_Mlym",
        "whisper_code": "ml",
        "edge_voice": "ml-IN-SobhanaNeural",
        "edge_voice_male": "ml-IN-MidhunNeural",
        "gtts_code": "ml",
        "tesseract_code": "mal",
    },
}

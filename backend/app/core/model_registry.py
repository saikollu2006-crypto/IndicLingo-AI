import threading
import time
from typing import Dict, Any, Optional
from app.config import settings, SUPPORTED_LANGUAGES
from app.core.device_manager import device_manager
from app.core.logging import logger
from app.core.exceptions import ModelLoadException

class ModelRegistry:
    """
    Centralized Model Registry with lazy loading, concurrency guards,
    and capability tracking.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelRegistry, cls).__new__(cls)
            cls._instance._init_registry()
        return cls._instance

    def _init_registry(self):
        self.models: Dict[str, Any] = {}
        self.tokenizers: Dict[str, Any] = {}
        self.status: Dict[str, Dict[str, Any]] = {
            "translation": {
                "name": settings.NLLB_MODEL_ID,
                "type": "Seq2SeqLM (NLLB-200 Distilled)",
                "status": "not_loaded",
                "device": device_manager.get_device(),
                "languages": list(SUPPORTED_LANGUAGES.keys()),
                "capabilities": ["text_translation", "document_translation", "cross_lingual_summary"],
                "last_loaded": None,
                "error": None,
            },
            "asr": {
                "name": f"openai-whisper-{settings.WHISPER_MODEL_SIZE}",
                "type": "Multilingual ASR",
                "status": "not_loaded",
                "device": device_manager.get_device(),
                "languages": list(SUPPORTED_LANGUAGES.keys()),
                "capabilities": ["speech_to_text", "voice_translation"],
                "last_loaded": None,
                "error": None,
            },
            "tts": {
                "name": "Edge-TTS & gTTS Dual Neural Synthesizer",
                "type": "Neural Text-to-Speech",
                "status": "ready",
                "device": "cloud-neural / edge",
                "languages": list(SUPPORTED_LANGUAGES.keys()),
                "capabilities": ["text_to_speech", "summary_audio", "translation_playback"],
                "last_loaded": time.time(),
                "error": None,
            },
            "summarization": {
                "name": "Hybrid Semantic Extractive & Abstractive Engine",
                "type": "Semantic Graph & NLP Summarizer",
                "status": "ready",
                "device": device_manager.get_device(),
                "languages": list(SUPPORTED_LANGUAGES.keys()),
                "capabilities": ["extractive_summary", "bullet_extraction", "cross_language_summary"],
                "last_loaded": time.time(),
                "error": None,
            },
            "ocr": {
                "name": "Tesseract OCR Engine",
                "type": "Optical Character Recognition",
                "status": "ready",
                "device": "cpu",
                "languages": list(SUPPORTED_LANGUAGES.keys()),
                "capabilities": ["scanned_pdf_ocr", "image_text_extraction"],
                "last_loaded": time.time(),
                "error": None,
            }
        }

    def get_translation_model(self):
        """Lazy load NLLB-200 translation model and tokenizer."""
        with self._lock:
            if "translation" in self.models and "translation" in self.tokenizers:
                return self.models["translation"], self.tokenizers["translation"]

            self.status["translation"]["status"] = "loading"
            logger.info(f"Loading translation model {settings.NLLB_MODEL_ID} on {device_manager.get_device()}...")
            start_time = time.time()

            try:
                from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
                
                tokenizer = AutoTokenizer.from_pretrained(settings.NLLB_MODEL_ID)
                device = device_manager.get_device()
                
                model = AutoModelForSeq2SeqLM.from_pretrained(
                    settings.NLLB_MODEL_ID,
                    use_safetensors=False,
                    low_cpu_mem_usage=True,
                )
                model = model.to(device)
                model.eval()

                self.models["translation"] = model
                self.tokenizers["translation"] = tokenizer
                self.status["translation"]["status"] = "loaded"
                self.status["translation"]["last_loaded"] = time.time()
                self.status["translation"]["load_duration_s"] = round(time.time() - start_time, 2)
                self.status["translation"]["error"] = None
                
                logger.info(f"Translation model loaded successfully in {round(time.time() - start_time, 2)}s.")
                return model, tokenizer

            except Exception as e:
                self.status["translation"]["status"] = "error"
                self.status["translation"]["error"] = str(e)
                logger.error(f"Failed to load translation model: {e}")
                raise ModelLoadException(settings.NLLB_MODEL_ID, str(e))

    def get_asr_model(self):
        """Lazy load OpenAI Whisper ASR model."""
        with self._lock:
            if "asr" in self.models:
                return self.models["asr"]

            self.status["asr"]["status"] = "loading"
            logger.info(f"Loading Whisper model ({settings.WHISPER_MODEL_SIZE}) on {device_manager.get_device()}...")
            start_time = time.time()

            try:
                import whisper
                model = whisper.load_model(
                    settings.WHISPER_MODEL_SIZE,
                    device=device_manager.get_device()
                )

                self.models["asr"] = model
                self.status["asr"]["status"] = "loaded"
                self.status["asr"]["last_loaded"] = time.time()
                self.status["asr"]["load_duration_s"] = round(time.time() - start_time, 2)
                self.status["asr"]["error"] = None
                
                logger.info(f"Whisper model loaded successfully in {round(time.time() - start_time, 2)}s.")
                return model

            except Exception as e:
                self.status["asr"]["status"] = "error"
                self.status["asr"]["error"] = str(e)
                logger.error(f"Failed to load Whisper ASR model: {e}")
                raise ModelLoadException(f"whisper-{settings.WHISPER_MODEL_SIZE}", str(e))

    def get_status(self) -> Dict[str, Any]:
        """Returns the live capability registry and hardware status."""
        return {
            "device_info": device_manager.get_device_info(),
            "models": self.status,
            "supported_languages": {
                code: {
                    "name": meta["name"],
                    "native_name": meta["native_name"],
                    "script": meta["script"],
                    "translation": True,
                    "asr": True,
                    "tts": True,
                    "summarization": True,
                    "ocr": True,
                }
                for code, meta in SUPPORTED_LANGUAGES.items()
            }
        }

model_registry = ModelRegistry()

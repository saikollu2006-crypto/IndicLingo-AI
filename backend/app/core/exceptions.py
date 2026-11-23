class IndicLingoException(Exception):
    """Base exception for all IndicLingo AI errors."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

class UnsupportedLanguageException(IndicLingoException):
    def __init__(self, language: str):
        super().__init__(f"Language '{language}' is not supported. Supported: English (en), Kannada (kn), Hindi (hi), Telugu (te), Tamil (ta), Malayalam (ml).", 422)

class ModelLoadException(IndicLingoException):
    def __init__(self, model_name: str, reason: str):
        super().__init__(f"Failed to load AI model '{model_name}': {reason}", 503)

class FileProcessingException(IndicLingoException):
    def __init__(self, reason: str):
        super().__init__(f"Document processing failed: {reason}", 400)

class FileSizeExceededException(IndicLingoException):
    def __init__(self, message: str = "Uploaded file exceeds maximum permitted size"):
        super().__init__(message, 413)

class AudioProcessingException(IndicLingoException):
    def __init__(self, reason: str):
        super().__init__(f"Audio processing failed: {reason}", 400)

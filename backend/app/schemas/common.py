from typing import Any, Optional
from pydantic import BaseModel, Field

class BaseResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    code: Optional[str] = None

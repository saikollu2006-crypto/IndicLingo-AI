from typing import Optional, Any
from pydantic import BaseModel

class JobStatusResponse(BaseModel):
    job_id: str
    status: str  # "queued", "processing", "completed", "failed"
    progress: int  # 0 to 100
    stage: str
    error: Optional[str] = None
    result: Optional[Any] = None
    created_at: str
    updated_at: str

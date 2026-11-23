import time
import uuid
import threading
from typing import Dict, Any, Optional

class JobService:
    """Manages asynchronous long-running task states and progress updates."""
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(JobService, cls).__new__(cls)
            cls._instance.jobs: Dict[str, Dict[str, Any]] = {}
        return cls._instance

    def create_job(self, job_type: str, initial_stage: str = "Queued") -> str:
        job_id = f"job_{uuid.uuid4().hex[:12]}"
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        with self._lock:
            self.jobs[job_id] = {
                "job_id": job_id,
                "job_type": job_type,
                "status": "processing",
                "progress": 5,
                "stage": initial_stage,
                "result": None,
                "error": None,
                "created_at": now,
                "updated_at": now,
            }
        return job_id

    def update_job(
        self,
        job_id: str,
        progress: int,
        stage: str,
        status: Optional[str] = "processing",
        result: Optional[Any] = None,
        error: Optional[str] = None
    ):
        with self._lock:
            if job_id in self.jobs:
                self.jobs[job_id]["progress"] = progress
                self.jobs[job_id]["stage"] = stage
                if status:
                    self.jobs[job_id]["status"] = status
                if result is not None:
                    self.jobs[job_id]["result"] = result
                if error is not None:
                    self.jobs[job_id]["error"] = error
                    self.jobs[job_id]["status"] = "failed"
                self.jobs[job_id]["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            return self.jobs.get(job_id)

job_service = JobService()

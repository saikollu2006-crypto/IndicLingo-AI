import os
import torch
from app.config import settings

class DeviceManager:
    """Manages execution device (CPU / CUDA) and resource allocation."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DeviceManager, cls).__new__(cls)
            cls._instance._init_device()
        return cls._instance

    def _init_device(self):
        pref = settings.DEVICE.lower()
        if pref == "cuda" and torch.cuda.is_available():
            self.device = "cuda"
            self.device_name = torch.cuda.get_device_name(0)
        elif pref == "auto":
            if torch.cuda.is_available():
                self.device = "cuda"
                self.device_name = torch.cuda.get_device_name(0)
            else:
                self.device = "cpu"
                self.device_name = "CPU Execution Engine"
        else:
            self.device = "cpu"
            self.device_name = "CPU Execution Engine"

        # Optimize PyTorch CPU threading if running on CPU
        if self.device == "cpu":
            num_cores = os.cpu_count() or 4
            threads = max(1, min(8, num_cores))
            torch.set_num_threads(threads)

    def get_device(self) -> str:
        return self.device

    def get_device_info(self) -> dict:
        info = {
            "device": self.device,
            "device_name": self.device_name,
            "cuda_available": torch.cuda.is_available(),
            "cpu_threads": torch.get_num_threads(),
        }
        if torch.cuda.is_available():
            info["cuda_device_count"] = torch.cuda.device_count()
            info["cuda_allocated_mb"] = round(torch.cuda.memory_allocated() / (1024 * 1024), 2)
        return info

device_manager = DeviceManager()

from fastapi import APIRouter, BackgroundTasks
from app.core.model_registry import model_registry
from app.core.device_manager import device_manager

router = APIRouter()

@router.get("/models/status")
async def get_models_status():
    return {
        "success": True,
        "device": device_manager.get_device_info(),
        "models": model_registry.get_status()
    }

@router.post("/models/preload")
async def preload_models(background_tasks: BackgroundTasks):
    def load_all():
        model_registry.get_translation_model()
        model_registry.get_asr_model()
        
    background_tasks.add_task(load_all)
    return {
        "success": True,
        "message": "Model background preloading initiated"
    }

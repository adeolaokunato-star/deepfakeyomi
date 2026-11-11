from fastapi import APIRouter

router = APIRouter(tags=["status"])

@router.get("/status")
def status():
    return {
        "app": "MIRRORA AI",
        "version": "0.1.0",
        "modules": {
            "face": "planned",
            "voice": "planned",
            "calls": "planned",
            "consent": "planned"
        }
    }

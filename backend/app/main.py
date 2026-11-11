from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.status import router as status_router
from app.core.database import Base, engine
from app.modules.consent import models
from app.modules.consent.routes import router as consent_router


app = FastAPI(
    title="MIRRORA AI API",
    version="0.1.0"
)


Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(health_router)
app.include_router(status_router, prefix="/api")
app.include_router(consent_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "MIRRORA AI API is running",
        "version": "0.1.0"
    }


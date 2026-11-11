from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


ConsentType = Literal[
    "face_processing",
    "voice_processing",
    "live_calls",
    "data_storage"
]


class ConsentRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=100)
    consent_type: ConsentType


class ConsentResponse(BaseModel):
    user_id: str
    consent_type: str
    granted: bool
    granted_at: datetime | None
    revoked_at: datetime | None


class ConsentEventResponse(BaseModel):
    user_id: str
    consent_type: str
    action: str
    created_at: datetime

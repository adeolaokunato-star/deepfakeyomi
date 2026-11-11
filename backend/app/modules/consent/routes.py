from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.consent.models import ConsentRecord, ConsentEvent
from app.modules.consent.schemas import (
    ConsentRequest,
    ConsentResponse,
    ConsentEventResponse
)

router = APIRouter(prefix="/consent", tags=["consent"])


@router.post("/grant", response_model=ConsentResponse)
def grant_consent(
    request: ConsentRequest,
    db: Session = Depends(get_db)
):
    record = db.query(ConsentRecord).filter(
        ConsentRecord.user_id == request.user_id,
        ConsentRecord.consent_type == request.consent_type
    ).first()

    now = datetime.now(timezone.utc)

    if record is None:
        record = ConsentRecord(
            user_id=request.user_id,
            consent_type=request.consent_type,
            granted=True,
            granted_at=now,
            revoked_at=None
        )
        db.add(record)
    elif not record.granted:
        record.granted = True
        record.granted_at = now
        record.revoked_at = None

    event = ConsentEvent(
        user_id=request.user_id,
        consent_type=request.consent_type,
        action="granted"
    )

    db.add(event)
    db.commit()
    db.refresh(record)

    return record


@router.post("/revoke", response_model=ConsentResponse)
def revoke_consent(
    request: ConsentRequest,
    db: Session = Depends(get_db)
):
    record = db.query(ConsentRecord).filter(
        ConsentRecord.user_id == request.user_id,
        ConsentRecord.consent_type == request.consent_type
    ).first()

    if record is None or not record.granted:
        raise HTTPException(
            status_code=404,
            detail="No active consent found for this permission."
        )

    now = datetime.now(timezone.utc)

    record.granted = False
    record.revoked_at = now

    event = ConsentEvent(
        user_id=request.user_id,
        consent_type=request.consent_type,
        action="revoked"
    )

    db.add(event)
    db.commit()
    db.refresh(record)

    return record


@router.get("/{user_id}", response_model=list[ConsentResponse])
def get_user_consents(
    user_id: str,
    db: Session = Depends(get_db)
):
    return db.query(ConsentRecord).filter(
        ConsentRecord.user_id == user_id
    ).all()


@router.get(
    "/{user_id}/history",
    response_model=list[ConsentEventResponse]
)
def get_consent_history(
    user_id: str,
    db: Session = Depends(get_db)
):
    return db.query(ConsentEvent).filter(
        ConsentEvent.user_id == user_id
    ).order_by(ConsentEvent.created_at.desc()).all()

from fastapi import Request, APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app import crud, schemas
from backend.app.db_session import get_db_session
from backend.app.rate_limiter import global_rate_limiter

router = APIRouter(
    prefix="/entry"
)

@router.post("", response_model=schemas.GetHabitEntry | None)
@global_rate_limiter.limit("60/minute")
def create_or_update_entry(
        request: Request,
        entry: schemas.CreateHabitEntry,
        db: Session = Depends(get_db_session)
):
    return crud.create_or_update_entry(db=db, entry=entry)
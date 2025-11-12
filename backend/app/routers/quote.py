from fastapi import Request, APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app import schemas
from backend.app.db_session import get_db_session
from backend.app.services import ai_quote
from backend.app.rate_limiter import global_rate_limiter

router = APIRouter(
    prefix="/quote",
)

@router.get("", response_model=schemas.QuoteBase)
@global_rate_limiter.limit("10/minute")
async def get_ai_motivational_quote(
        request: Request,
        db: Session = Depends(get_db_session)
):
    quote = await ai_quote.get_motivational_quote(db)
    return quote
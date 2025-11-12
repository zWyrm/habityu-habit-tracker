from fastapi import Request, APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import date

from backend.app.db_session import get_db_session
from backend.app.rate_limiter import global_rate_limiter
from backend.app.services.pdf_report import create_full_report

router = APIRouter(
    prefix="/export",
)

@router.get("/pdf")
@global_rate_limiter.limit("10/minute")
def export_pdf_report(request: Request, db: Session = Depends(get_db_session)):
    pdf = create_full_report(db)

    return StreamingResponse(
        [pdf],
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=habit_insights_report_{date.today()}.pdf"
        }
    )
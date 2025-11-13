from fastapi import Request, APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from backend.app import insights
from backend.app import schemas
from backend.app.db_session import get_db_session
from backend.app.rate_limiter import global_rate_limiter

router = APIRouter(
    prefix="/insights",
)

@router.get(
    "/overall/week",
    response_model=schemas.SidebarWeekInsights
)
@global_rate_limiter.limit("60/minute")
def get_sidebar_week_insights(
    request: Request,
    today_date: date,
    db: Session = Depends(get_db_session)
):
    return insights.get_sidebar_week_insights(db=db, today_date=today_date)

@router.get(
    "/overall/calendar",
    response_model=schemas.SidebarCalendarInsights
)
@global_rate_limiter.limit("60/minute")
def get_sidebar_calendar_insights(
    request: Request,
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db_session)
):
    return insights.get_sidebar_calendar_insights(
        db=db,
        start_date=start_date,
        end_date=end_date
    )

@router.get(
    "/{habit_id}/stats",
    response_model=schemas.HabitStats
)
@global_rate_limiter.limit("60/minute")
def get_habit_stats(
    request: Request,
    habit_id: int,
    today_date: date,
    db: Session = Depends(get_db_session)
):
    return insights.get_habit_streaks_and_total_completions(db=db, habit_id=habit_id, today_date=today_date)


@router.get(
    "/{habit_id}/chart",
    response_model=schemas.HabitChart
)
@global_rate_limiter.limit("60/minute")
def get_habit_chart(
    request: Request,
    habit_id: int,
    start_date: date,
    end_date: date,
    chart_view: str = "weekly",
    db: Session = Depends(get_db_session)
):
    return insights.get_habit_chart_data(
        db=db,
        habit_id=habit_id,
        view=chart_view,
        start_date=start_date,
        end_date=end_date
    )


@router.get(
    "/{habit_id}/heatmap",
    response_model=schemas.HabitHeatmap
)
@global_rate_limiter.limit("60/minute")
def get_habit_heatmap(
    request: Request,
    habit_id: int,
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db_session)
):
    return insights.get_habit_heatmap_data(
        db=db,
        habit_id=habit_id,
        start_date=start_date,
        end_date=end_date
    )
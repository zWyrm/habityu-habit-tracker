from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_, select, column, literal_column
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from datetime import date, timedelta
from typing import List

from backend.app import models, schemas


def _get_habit_completion_percentage():
    return case(
        (models.Habit.type == models.HabitType.simple, case((models.HabitEntry.value >= 1, 100.0), else_=0.0)),
        (and_( models.Habit.type == models.HabitType.measurable, models.Habit.target > 0), func.min(100.0,(models.HabitEntry.value / models.Habit.target) * 100)),
        else_=0.0
    )

def _calculate_streaks(db: Session, completed_dates) -> tuple[int, int]:
    streak_groups = select(
        column("date"),
        (func.julianday(column("date")) - func.row_number().over(order_by=column("date"))).label("streak_group_id")
    ).select_from(
        completed_dates
    ).cte("streak_groups")

    streak_data = select(
        func.count().label("streak_length"),
        func.max(column("date")).label("end_date")
    ).select_from(
        streak_groups
    ).group_by(
        column("streak_group_id")
    ).cte("streak_data")

    today = date.today()
    yesterday = today - timedelta(days=1)

    final_query = select(
        func.max(
            case(
                (column("end_date").in_([today, yesterday]), column("streak_length")),
                else_=0
            )
        ).label("current_streak"),
        func.max(column("streak_length")).label("max_streak")
    ).select_from(streak_data)

    result = db.execute(final_query).first()
    return result.current_streak or 0, result.max_streak or 0


def _get_habit_streaks(db: Session, habit_id: int) -> tuple[int, int]:
    completed_dates = select(
        models.HabitEntry.date.label("date")
    ).filter(
        models.HabitEntry.habit_id == habit_id,
        models.HabitEntry.is_completed == True
    ).cte("completed_dates")

    return _calculate_streaks(db, completed_dates)


def _get_overall_streaks(db: Session) -> tuple[int, int]:
    completed_dates = select(
        models.HabitEntry.date.distinct().label("date")
    ).filter(
        models.HabitEntry.is_completed == True
    ).cte("completed_dates")

    return _calculate_streaks(db, completed_dates)


def _get_calendar_stats(db: Session, total_habits: int, start_date: date, end_date: date) -> List[schemas.SingleCalendarDayStat]:
    if total_habits == 0:  # division by zero
        return []

    daily_stats_query = select(
        models.HabitEntry.date,
        (func.sum(_get_habit_completion_percentage()) / total_habits).label('percentage')
    ).join(
        models.Habit,
        models.HabitEntry.habit_id == models.Habit.id
    ).filter(
        models.HabitEntry.date >= start_date,
        models.HabitEntry.date <= end_date
    ).group_by(
        models.HabitEntry.date
    ).order_by(
        models.HabitEntry.date
    )

    daily_stats = db.execute(daily_stats_query).all()
    return [schemas.SingleCalendarDayStat(date=stat.date, completed_percentage=round(stat.percentage, 2)) for stat in daily_stats]


def _get_weekly_chart_data(db: Session, habit_id: int, start_date: date, end_date: date):
    weekly_chart_data_query = select(
        literal_column("strftime('%G', date)").label('year'),
        literal_column("strftime('%V', date)").label('week'),
        func.sum(case((models.HabitEntry.is_completed == 1, 1), else_=0)).label('days_completed')
    ).filter(
        models.HabitEntry.habit_id == habit_id,
        models.HabitEntry.date >= start_date,
        models.HabitEntry.date <= end_date
    ).group_by(
        literal_column("strftime('%G-%V', date)")
    ).order_by(
        literal_column("strftime('%G-%V', date)")
    )

    weekly_chart_data = db.execute(weekly_chart_data_query)

    chart_data = []
    for year, week, days_completed in weekly_chart_data:
        week_start = max(date.fromisocalendar(int(year), int(week), 1), start_date)
        week_end = min(week_start + timedelta(days=6), end_date)
        total_possible = (week_end - week_start).days + 1
        if total_possible > 0:
            percentage = (days_completed / total_possible) * 100
        else:
            percentage = 0
        label = week_start.strftime('%b %d')
        chart_data.append(schemas.ChartDataPoint(date=label, value=round(percentage, 2)))
    return chart_data


def _get_monthly_chart_data(db: Session, habit_id: int, start_date: date, end_date: date):
    monthly_chart_data_query = select(
        literal_column("strftime('%Y', date)").label('year'),
        literal_column("strftime('%m', date)").label('month'),
        func.sum(case((models.HabitEntry.is_completed == 1, 1), else_=0)).label('days_completed')
    ).filter(
        models.HabitEntry.habit_id == habit_id,
        models.HabitEntry.date >= start_date,
        models.HabitEntry.date <= end_date
    ).group_by(
        literal_column("strftime('%Y-%m', date)")
    ).order_by(
        literal_column("strftime('%Y-%m', date)")
    )

    monthly_chart_data = db.execute(monthly_chart_data_query)

    chart_data = []
    for year, month, days_completed in monthly_chart_data:
        month_start = max(date(int(year), int(month), 1), start_date)
        if int(month) == 12:
            next_month = date(int(year) + 1, 1, 1)
        else:
            next_month = date(int(year), int(month) + 1, 1)

        month_end = min(next_month - timedelta(days=1), end_date)
        total_possible = (month_end - month_start).days + 1
        if total_possible > 0:
            percentage = (days_completed / total_possible) * 100
        else:
            percentage = 0
        label = month_start.strftime('%b %Y')
        chart_data.append(schemas.ChartDataPoint(date=label, value=round(percentage, 2)))
    return chart_data


def get_sidebar_week_insights(db: Session) -> schemas.SidebarWeekInsights:
    try:
        today = date.today()

        current_overall_streak, longest_overall_streak = _get_overall_streaks(db)

        start_of_week = today - timedelta(days=today.weekday())

        daily_status_query = select(
            models.HabitEntry.date,
            func.max(models.HabitEntry.is_completed).label("completed")
        ).filter(
            models.HabitEntry.date >= start_of_week,
            models.HabitEntry.date <= today
        ).group_by(
            models.HabitEntry.date
        )

        daily_status = db.execute(daily_status_query)

        completed_days_this_week = {row.date for row in daily_status if row.completed}

        days_of_week = [schemas.WeekDay.MON, schemas.WeekDay.TUE, schemas.WeekDay.WED, schemas.WeekDay.THU, schemas.WeekDay.FRI, schemas.WeekDay.SAT, schemas.WeekDay.SUN]
        current_week_stats = []

        for i in range(7):
            day_date = start_of_week + timedelta(days=i)
            name = days_of_week[i]

            if day_date > today:
                status = schemas.DayStatus.PENDING
            elif day_date in completed_days_this_week:
                status = schemas.DayStatus.COMPLETED
            elif day_date == today:
                status = schemas.DayStatus.PENDING
            else:
                status = schemas.DayStatus.MISSED

            current_week_stats.append(schemas.SingleWeekDayStat(day=name, status=status))

        return schemas.SidebarWeekInsights(
            current_overall_streak=current_overall_streak,
            longest_overall_streak=longest_overall_streak,
            current_week_stats=current_week_stats
        )

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Failed to fetch sidebar week stats")


def get_sidebar_calendar_insights(
        db: Session,
        start_date: date,
        end_date: date
) -> schemas.SidebarCalendarInsights:
    try:
        total_habits_query = select(func.count(models.Habit.id))
        total_habits = db.scalar(total_habits_query) or 0

        calendar_stats = _get_calendar_stats(db, total_habits, start_date, end_date)

        return schemas.SidebarCalendarInsights(
            calendar_stats=calendar_stats
        )

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500, detail="Failed to fetch sidebar calendar insights data"
        )


def get_habit_streaks_and_total_completions(
        db: Session,
        habit_id: int,
) -> schemas.HabitStats:
    try:
        current_streak, max_streak = _get_habit_streaks(db, habit_id)

        total_completions_query = select(
            func.count(models.HabitEntry.date)
        ).filter(
            models.HabitEntry.habit_id == habit_id,
            models.HabitEntry.is_completed == True
        )

        total_completions = db.scalar(total_completions_query) or 0

        return schemas.HabitStats(
            current_streak=current_streak,
            longest_streak=max_streak,
            total_completions=total_completions
        )
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Failed to fetch habit stats")


def get_habit_chart_data(
        db: Session,
        habit_id: int,
        view: str,
        start_date: date,
        end_date: date
) -> schemas.HabitChart:
    try:
        if view == "weekly":
            chart_data = _get_weekly_chart_data(db, habit_id, start_date, end_date)
        else:  # monthly
            chart_data = _get_monthly_chart_data(db, habit_id, start_date, end_date)

        return schemas.HabitChart(view=view, data=chart_data)

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Failed to fetch habit chart data")


def get_habit_heatmap_data(
        db: Session,
        habit_id: int,
        start_date: date,
        end_date: date
) -> schemas.HabitHeatmap:
    try:
        heatmap_entries_query = select(
            models.HabitEntry.date,
            _get_habit_completion_percentage().label("percentage")
        ).join(
            models.Habit,
            models.HabitEntry.habit_id == models.Habit.id
        ).filter(
            models.HabitEntry.habit_id == habit_id,
            models.HabitEntry.date >= start_date,
            models.HabitEntry.date <= end_date
        )

        heatmap_entries = db.execute(heatmap_entries_query)

        data = [
            schemas.HeatmapDataPoint(date=entry.date, value=round(entry.percentage, 2))
            for entry in heatmap_entries
        ]
        return schemas.HabitHeatmap(heatmap_data=data)

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Failed to fetch habit heatmap data")

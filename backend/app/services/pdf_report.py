import io
from datetime import date, timedelta
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.lib import colors

from backend.app import crud, insights


def _get_formated_date(d: date) -> str:
    day = d.day
    if 11 <= day <= 13:
        suffix = "th"
    else:
        suffix_map = {1: "st", 2: "nd", 3: "rd"}
        suffix = suffix_map.get(day % 10, "th")

    return f"{day}{suffix} {d.strftime('%B %Y')}"


def _build_habit_table(db: Session, today_date: date) -> Table:
    today = today_date
    dates = [today - timedelta(days=i) for i in range(7)]
    date_labels = ["Today", "Yesterday"] + [(today - timedelta(days=i)).strftime("%a") for i in range(2, 7)]

    start_date = today - timedelta(days=6)
    habits = crud.get_habit_table_data(db, start_date=start_date, end_date=today)
    if not habits:
        return None

    table_data = [["Habit"] + date_labels]

    for habit in habits:
        row = [habit.name] + [""] * 7
        table_data.append(row)

    style = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0077B6")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#3f3f3f")),
    ]

    for row_idx, habit in enumerate(habits, start=1):
        completed_dates = {entry.date for entry in habit.entries}
        for col_idx, d in enumerate(dates, start=1):
            bg = colors.HexColor("#C8E6C9") if d in completed_dates else colors.HexColor("#FFCDD2")
            style.append(('BACKGROUND', (col_idx, row_idx), (col_idx, row_idx), bg))

    table = Table(table_data, colWidths=[1.5 * inch] + [0.85 * inch] * 7)
    table.setStyle(TableStyle(style))
    return table


def create_full_report(db: Session, today_date: date) -> Table:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch
    )

    styles = getSampleStyleSheet()
    content = []

    try:
        content.append(Paragraph(f"Habit Insights Report - {_get_formated_date(today_date)}", styles['h1']))

        sidebar_data = insights.get_sidebar_week_insights(db, today_date)
        content.append(Paragraph("Overall Statistics", styles['h2']))
        content.append(Paragraph(f"<b>Current Streak:</b> {sidebar_data.current_overall_streak} days"))
        content.append(Paragraph(f"<b>Longest Streak:</b> {sidebar_data.longest_overall_streak} days"))

        content.append(Paragraph("Past 7-Day Status", styles['h2']))
        table = _build_habit_table(db, today_date)
        if table is not None:
            content.append(table)
        else:
            content.append(Paragraph("Error creating table"))

    except Exception as e:
        content.append(Paragraph(f"Error generating pdf report: {str(e)}"))

    doc.build(content)
    buffer.seek(0)
    return buffer.getvalue()
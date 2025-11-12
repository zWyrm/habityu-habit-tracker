from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import List
import enum
from backend.app.models import HabitType


class DayStatus(str, enum.Enum):
    COMPLETED = "completed"
    MISSED = "missed"
    PENDING = "pending"

class WeekDay(str, enum.Enum):
    MON = "mon"
    TUE = "tue"
    WED = "wed"
    THU = "thu"
    FRI = "fri"
    SAT = "sat"
    SUN = "sun"

class QuoteBase(BaseModel):
    quote: str
    author: str

class HabitBase(BaseModel):
    name: str
    type: HabitType
    color: str
    target: float | None = None
    unit: str | None = None

class CreateHabit(HabitBase):
    pass

class GetHabit(HabitBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class HabitEntryBase(BaseModel):
    date: date
    value: float
    habit_id: int

class CreateHabitEntry(HabitEntryBase):
    pass

class GetHabitEntry(HabitEntryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class SingleWeekDayStat(BaseModel):
    day: WeekDay
    status: DayStatus

class SingleCalendarDayStat(BaseModel):
    date: date
    completed_percentage: float

class SidebarWeekInsights(BaseModel):
    current_overall_streak: int
    longest_overall_streak: int
    current_week_stats: List[SingleWeekDayStat]

class SidebarCalendarInsights(BaseModel):
    calendar_stats: List[SingleCalendarDayStat]

class ChartDataPoint(BaseModel):
    date: str
    value: float

class HeatmapDataPoint(BaseModel):
    date: date
    value: float

class HabitStats(BaseModel):
    current_streak: int
    longest_streak: int
    total_completions: int

class HabitChart(BaseModel):
    view: str
    data: List[ChartDataPoint]

class HabitHeatmap(BaseModel):
    heatmap_data: List[HeatmapDataPoint]

class HabitTable(GetHabit):
    entries: List[GetHabitEntry]
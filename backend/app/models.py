import enum
from sqlalchemy import Column, Boolean, Integer, String, Float, Date, ForeignKey, Enum, Index
from sqlalchemy.orm import relationship
from backend.app.database import Base
import datetime


class HabitType(str, enum.Enum):
    simple = "simple"
    measurable = "measurable"


class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    created_date = Column(Date, nullable=False, default=datetime.date.today)
    type = Column(Enum(HabitType), nullable=False)
    color = Column(String, default="#1677ff")
    target = Column(Float, nullable=True)
    unit = Column(String, nullable=True)

    entries = relationship("HabitEntry", back_populates="habit", cascade="all, delete-orphan")


class HabitEntry(Base):
    __tablename__ = "habit_entries"

    __table_args__ = (
        Index('idx_date', 'date'),
        Index('idx_habitId_date', 'habit_id', 'date'),
        Index('idx_isCompleted', 'is_completed'),
        Index('idx_habitId_completed', 'habit_id', 'is_completed'),
    )

    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False)
    value = Column(Float, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)

    habit = relationship("Habit", back_populates="entries")
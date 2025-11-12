from datetime import date
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException

from backend.app import models, schemas


def get_habit(db: Session, habit_id: int):
    return db.scalar(select(models.Habit).filter_by(id=habit_id))

#!
def get_all_habits(db: Session):
    return db.scalars(select(models.Habit)).all()

def create_habit(db: Session, habit: schemas.CreateHabit):
    try:
        if habit.type == models.HabitType.measurable:
            if habit.target is None or habit.target <= 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing or invalid target value in {habit.name}, need to be greater than 0"
                )

        new_habit = models.Habit(
            name=habit.name,
            type=habit.type,
            color=habit.color,
        )
        if habit.type == models.HabitType.measurable:
            new_habit.target=habit.target
            new_habit.unit=habit.unit

        db.add(new_habit)
        db.commit()
        db.refresh(new_habit)
        return new_habit

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(500, "Failed to create habit")


def update_habit(db: Session, curr_habit: models.Habit, habit_update: schemas.CreateHabit):
    try:
        curr_habit.name = habit_update.name
        curr_habit.color = habit_update.color

        if curr_habit.type == models.HabitType.simple:
            db.commit()
            db.refresh(curr_habit)
            return curr_habit


        if habit_update.target is None or habit_update.target <= 0:
            raise HTTPException(
                status_code=400,
                detail=f"Missing or invalid target value for {curr_habit.name}, need to be greater than 0"
            )

        prev_target = curr_habit.target

        curr_habit.target = habit_update.target
        curr_habit.unit = habit_update.unit

        if prev_target != curr_habit.target:
            update_entries_query = update(models.HabitEntry).where(
                models.HabitEntry.habit_id == curr_habit.id
            ).values(
                is_completed= models.HabitEntry.value >= curr_habit.target
            )
            db.execute(update_entries_query)

        db.commit()
        db.refresh(curr_habit)
        return curr_habit

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(500, "Failed to update habit")


def delete_habit(db: Session, curr_habit: models.Habit):
    try:
        db.delete(curr_habit)
        db.commit()
        return curr_habit

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(500, "Failed to delete habit")

def create_or_update_entry(db: Session, entry: schemas.CreateHabitEntry):
    try:
        habit = get_habit(db, habit_id=entry.habit_id)
        if not habit:
            raise HTTPException(
                status_code=404,
                detail="Habit not found"
            )

        select_entry = select(models.HabitEntry).filter_by(
            habit_id=entry.habit_id,
            date=entry.date
        )
        curr_entry = db.scalar(select_entry)

        if entry.value == 0:
            if curr_entry:
                db.delete(curr_entry)
                db.commit()
            return None

        completed = False
        if habit.type == models.HabitType.simple:
            if entry.value == 1:
                completed = True
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid value for simple habit, only binary 0/1 allowed"
                )
        else:
            if entry.value <= 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid value, must be positive"
                )
            if entry.value >= habit.target:
                completed = True

        if curr_entry:
            curr_entry.value = entry.value
            curr_entry.is_completed = completed
        else:
            curr_entry = models.HabitEntry(
                habit_id=entry.habit_id,
                date=entry.date,
                value=entry.value,
                is_completed=completed
            )
            db.add(curr_entry)

        db.commit()
        db.refresh(curr_entry)
        return curr_entry

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(500, "Failed to log habit entry")

def get_habit_table_data(db: Session, start_date: date, end_date: date):
    try:
        habits = get_all_habits(db)

        entries_query = (
            select(models.HabitEntry)
            .filter(
                models.HabitEntry.date >= start_date,
                models.HabitEntry.date <= end_date
            )
        )
        entries = db.scalars(entries_query).all()

        habit_entries_map = {}
        for entry in entries:
            if entry.habit_id not in habit_entries_map:
                habit_entries_map[entry.habit_id] = []
            habit_entries_map[entry.habit_id].append(entry)

        for habit in habits:
            habit.entries = habit_entries_map.get(habit.id, [])

        return habits

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(500, "Failed to fetch habit table data")
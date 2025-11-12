from datetime import date
from typing import List
from fastapi import Request, APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app import crud, schemas
from backend.app.db_session import get_db_session
from backend.app.rate_limiter import global_rate_limiter

router = APIRouter(
    prefix="/habits",
)

@router.post("", response_model=schemas.GetHabit)
@global_rate_limiter.limit("60/minute")
def create_habit(
        habit: schemas.CreateHabit,
        request: Request,
        db: Session = Depends(get_db_session)
):
    return crud.create_habit(db=db, habit=habit)


@router.get("", response_model=List[schemas.GetHabit])
@global_rate_limiter.limit("60/minute")
def get_all_habits(request: Request, db: Session = Depends(get_db_session)):
    return crud.get_all_habits(db=db)

@router.get("/grid", response_model=List[schemas.HabitTable])
@global_rate_limiter.limit("60/minute")
def get_habit_table(
    request: Request,
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db_session)
):
    return crud.get_habit_table_data(db=db, start_date=start_date, end_date=end_date)

@router.put("/{habit_id}", response_model=schemas.GetHabit)
@global_rate_limiter.limit("60/minute")
def update_habit(
        request: Request,
        habit_id: int,
        habit_update: schemas.CreateHabit,
        db: Session = Depends(get_db_session)
):
    habit = crud.get_habit(db, habit_id=habit_id)
    if habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")
    return crud.update_habit(db=db, curr_habit=habit, habit_update=habit_update)


@router.delete("/{habit_id}", status_code=204)
@global_rate_limiter.limit("60/minute")
def delete_habit(request: Request, habit_id: int, db: Session = Depends(get_db_session)):
    habit = crud.get_habit(db, habit_id=habit_id)
    if habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")

    crud.delete_habit(db=db, curr_habit=habit)
    return
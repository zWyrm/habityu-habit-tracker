import httpx
import json
from fastapi import HTTPException
import asyncio
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.app import crud
from backend.app.config import OPENROUTER_API_KEY, OPENROUTER_MODEL, OPENROUTER_URL

DEFAULT_QUOTE = "Success is the sum of small efforts, repeated day in and day out."
DEFAULT_AUTHOR = "Robert Collier"


async def get_motivational_quote(db: Session) -> dict:
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Missing OPENROUTER_API_KEY"
        )

    try:
        all_habits = await asyncio.to_thread(crud.get_all_habits, db)
        habit_names = [habit.name for habit in all_habits]

    except SQLAlchemyError:
        return {"quote": DEFAULT_QUOTE, "author": DEFAULT_AUTHOR}


    if not habit_names:
        prompt = """Give a one-sentence motivational quote said by a real person about starting new habits and being consistent. Also provide the author's name. Respond with ONLY a valid JSON object in the format: {"quote": "Quote here", "author": "Author name here"}"""
    else:
        #!
        habits = ", ".join(habit_names)
        prompt = f"""The user is tracking habits like: {habits}. Give a one-sentence motivational quote said by a real person quote that relates to these goals. Also provide the author's name. Respond with ONLY a valid JSON object in the format: {{"quote": "Quote here", "author": "Author name here"}}"""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": OPENROUTER_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                }
            )

            response.raise_for_status()

            data = response.json()
            json_string = data['choices'][0]['message']['content']

            quote_data = json.loads(json_string)
            return quote_data


    except Exception:
        return {"quote": DEFAULT_QUOTE, "author": DEFAULT_AUTHOR}
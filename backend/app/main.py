from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded

from backend.app.routers import entries, export, habits, insights, quote

app = FastAPI(
    title="Habityu",
    docs_url = None,
    redoc_url = None
)

@app.exception_handler(RateLimitExceeded)
async def handle_rate_limit(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": f"Rate limit exceeded: {exc.detail}"}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check() -> dict:
    return {"status": "healthy", "message": "Habityu API is running."}

app.include_router(habits.router, prefix="/api")
app.include_router(entries.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(export.router, prefix="/api")
app.include_router(quote.router, prefix="/api")
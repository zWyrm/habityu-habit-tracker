from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded

from backend.app.routers import entries, export, habits, insights, quote
from backend.app.config import FRONTEND_URL, LOCAL_CORS_ORIGIN
app = FastAPI(
    title="Habityu",
    docs_url = None,
)

@app.exception_handler(RateLimitExceeded)
async def handle_rate_limit(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": f"Rate limit exceeded: {exc.detail}"}
    )

ALLOWED_ORIGINS = [FRONTEND_URL] if FRONTEND_URL else [LOCAL_CORS_ORIGIN]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

@app.get("/health")
def health_check() -> dict:
    return {"status": "healthy", "message": "Habityu API is running."}

app.include_router(habits.router, prefix="/api")
app.include_router(entries.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(export.router, prefix="/api")
app.include_router(quote.router, prefix="/api")
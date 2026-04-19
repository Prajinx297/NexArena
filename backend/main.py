import logging
import os
from datetime import datetime, timezone

import firebase_admin
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from routes.api import limiter, router as api_router
from routes.ws import router as ws_router
from services.db import ensure_firebase_initialized
from services.state import start_simulation_loop

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

app = FastAPI(title="NexArena API", description="AI-Powered Smart Stadium System")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

allowed_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "").split(",") if origin.strip()]
if not allowed_origins:
  allowed_origins = ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
app.include_router(ws_router, prefix="/api/ws")


@app.on_event("startup")
async def startup_event():
    try:
        if not firebase_admin._apps:
            ensure_firebase_initialized()
        logger.info("Firebase Admin initialized")
    except Exception as exc:
        logger.error("Firebase Admin init failed: %s", exc, exc_info=True)

    required_vars = ["GOOGLE_APPLICATION_CREDENTIALS", "ALLOWED_ORIGINS"]
    missing = [variable for variable in required_vars if not os.getenv(variable)]
    if missing:
        logger.warning("Missing env vars: %s - some features may fail", missing)

    start_simulation_loop()
    logger.info("NexArena backend started successfully")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again."},
    )


@app.get("/")
def read_root():
    return {"message": "NexArena Backend API is running.", "docs": "/docs"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.api import router as api_router
from routes.ws import router as ws_router

app = FastAPI(title="NexArena API", description="AI-Powered Smart Stadium System")

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routes
app.include_router(api_router, prefix="/api")
app.include_router(ws_router, prefix="/api/ws")

@app.get("/")
def read_root():
    return {"message": "NexArena Backend API is running.", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

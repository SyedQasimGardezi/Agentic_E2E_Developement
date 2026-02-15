from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager

from routes import agent, jira, github, figma
from logging_config.logger import logger
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
import os
from tools.websocket_manager import manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Agentic E2E Backend is starting...")
    logger.info("📡 Swagger UI available at http://localhost:8000/docs")
    yield

app = FastAPI(title="Agentic E2E Backend", lifespan=lifespan)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agent.router)
app.include_router(jira.router)
app.include_router(github.router)
app.include_router(figma.router)

# Ensure workspace exists for static mounting
if not os.path.exists("workspace"):
    os.makedirs("workspace")

# Mount workspace for live previews
app.mount("/preview", StaticFiles(directory="workspace", html=True), name="preview")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"message": "Agentic E2E Backend is running with modular structure"}

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "modules": {
            "agent": "active",
            "jira": "active",
            "github": "active"
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

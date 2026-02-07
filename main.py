from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager

from routes import agent, jira, github
from logging_config.logger import logger

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

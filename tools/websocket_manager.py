import asyncio
from fastapi import WebSocket
from typing import List
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.loop = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Capture the loop if not already done
        if not self.loop:
            self.loop = asyncio.get_event_loop()
        logger.info(f"New WebSocket connection. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        # Schedule the deletion of connections to avoid modification while iterating
        active = list(self.active_connections)
        for connection in active:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to WebSocket: {e}")
                self.disconnect(connection)

    def sync_broadcast(self, message: dict):
        """Thread-safe way to broadcast from sync code."""
        if not self.loop or not self.active_connections:
            return
            
        try:
            asyncio.run_coroutine_threadsafe(self.broadcast(message), self.loop)
        except Exception as e:
            logger.error(f"Failed to schedule sync_broadcast: {e}")

manager = ConnectionManager()

import asyncio
import datetime
import random
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.simulation import compute_crowd_density, alert_generator
from typing import List

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        try:
            self.active_connections.remove(websocket)
        except ValueError:
            pass

manager = ConnectionManager()

@router.websocket("/crowd/{event_id}")
async def websocket_crowd_endpoint(websocket: WebSocket, event_id: str):
    await manager.connect(websocket)
    try:
        # Initial system status
        await websocket.send_json({
            "type": "system_status",
            "status": "connected",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        })
        while True:
            density = compute_crowd_density(event_id)
            await websocket.send_json({
                "type": "crowd_update",
                "event_id": event_id,
                "heat_map": density,
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
            })
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.websocket("/alerts/{event_id}")
async def websocket_alerts_endpoint(websocket: WebSocket, event_id: str):
    await manager.connect(websocket)
    try:
        while True:
            alert = alert_generator(event_id)
            # Push whenever auto-alerts generates a new one. Here we simulate a new alert every 10-20 seconds.
            await asyncio.sleep(random.randint(10, 20))
            await websocket.send_json({
                "type": "alert",
                "event_id": event_id,
                "alert": alert,
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket)

import asyncio
import datetime
from typing import List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from services.state import get_latest_state, track_event

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
    track_event(event_id)
    await manager.connect(websocket)
    try:
        await websocket.send_json({
            "type": "system_status",
            "status": "connected",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        })
        while True:
            await websocket.send_json(get_latest_state(event_id))
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@router.websocket("/alerts/{event_id}")
async def websocket_alerts_endpoint(websocket: WebSocket, event_id: str):
    track_event(event_id)
    await manager.connect(websocket)
    try:
        while True:
            state = get_latest_state(event_id)
            alert = state.get("surge_warning") or {
                "title": "No active surge warning",
                "description": "Latest simulation state is within normal alert thresholds.",
                "severity": "info",
            }
            await websocket.send_json({
                "type": "alert",
                "event_id": event_id,
                "alert": alert,
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            })
            await asyncio.sleep(12)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

import asyncio
import datetime
import logging
from contextlib import suppress
from typing import List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from services.state import get_latest_state, track_event

logger = logging.getLogger(__name__)
router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        with suppress(ValueError):
            self.active_connections.remove(websocket)


manager = ConnectionManager()


async def send_ping(websocket: WebSocket):
    while True:
        await asyncio.sleep(30)
        await websocket.send_json({
            "type": "ping",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        })


@router.websocket("/crowd/{event_id}")
async def websocket_crowd_endpoint(websocket: WebSocket, event_id: str):
    track_event(event_id)
    await manager.connect(websocket)
    ping_task = asyncio.create_task(send_ping(websocket))
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
    except Exception as exc:
        logger.error("WebSocket crowd error: %s", exc, exc_info=True)
        await websocket.close(code=1011)
    finally:
        ping_task.cancel()
        manager.disconnect(websocket)


@router.websocket("/alerts/{event_id}")
async def websocket_alerts_endpoint(websocket: WebSocket, event_id: str):
    track_event(event_id)
    await manager.connect(websocket)
    ping_task = asyncio.create_task(send_ping(websocket))
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
    except Exception as exc:
        logger.error("WebSocket alert error: %s", exc, exc_info=True)
        await websocket.close(code=1011)
    finally:
        ping_task.cancel()
        manager.disconnect(websocket)

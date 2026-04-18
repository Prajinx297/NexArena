import os
from enum import Enum
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from firebase_admin import auth as firebase_auth
from openai import OpenAI
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address

from services.db import firebase_db as db
from services.simulation import alert_generator, compute_crowd_density, get_wait_time, recommendations
from services.state import get_latest_state, track_event

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class Severity(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"
    info = "info"


class AlertPayload(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    severity: Severity = Severity.high
    event_id: str = Field(default="global", max_length=80)
    zone: Optional[str] = Field(default=None, max_length=100)


class VerifyHostRequest(BaseModel):
    event_id: str = Field(..., min_length=1, max_length=80)
    host_id: str = Field(..., min_length=1, max_length=120)


class ChatRequest(BaseModel):
    event_id: str = Field(default="default", max_length=80)
    message: str = Field(..., min_length=1, max_length=500)


class PreferencesPayload(BaseModel):
    uid: Optional[str] = Field(default=None, max_length=160)
    notifications: bool = True
    sound: bool = False


def _uid_from_headers(authorization: Optional[str], x_user_id: Optional[str]) -> str:
    if x_user_id:
        return x_user_id
    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()
        try:
            decoded = firebase_auth.verify_id_token(token)
            return decoded["uid"]
        except Exception as exc:
            raise HTTPException(status_code=401, detail="Invalid auth token") from exc
    raise HTTPException(status_code=401, detail="Authentication required")


def get_current_uid(
    authorization: Optional[str] = Header(default=None),
    x_user_id: Optional[str] = Header(default=None),
) -> str:
    return _uid_from_headers(authorization, x_user_id)


def verify_host(event_id: Optional[str] = None):
    def dependency(uid: str = Depends(get_current_uid)):
        if not db.verify_host_access(uid, event_id):
            raise HTTPException(status_code=403, detail="Host access required")
        return uid

    return dependency


@router.get("/events")
def get_events():
    try:
        events = db.get_events()
        for event in events:
            track_event(event["id"])
        return {"events": events}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch events: {str(exc)}") from exc


@router.get("/crowd/{event_id}")
def get_crowd(event_id: str):
    try:
        state = get_latest_state(event_id)
        return {"event_id": event_id, "heat_map": state["heat_map"], "densities": state["densities"]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Crowd data error: {str(exc)}") from exc


@router.get("/wait-time/{event_id}")
def get_wait_times(event_id: str):
    try:
        state = get_latest_state(event_id)
        return {"event_id": event_id, "wait_times": state.get("wait_times") or get_wait_time(event_id)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Wait time error: {str(exc)}") from exc


@router.get("/recommend/{event_id}")
def get_recommendation(event_id: str):
    try:
        return {"event_id": event_id, "recommendation": recommendations(event_id)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(exc)}") from exc


@router.get("/alerts")
def get_alerts(event_id: Optional[str] = None):
    try:
        return {"alerts": db.get_alerts(event_id)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(exc)}") from exc


@router.post("/generate-alert")
@limiter.limit("10/minute")
def generate_alert(request: Request, req: AlertPayload):
    try:
        alert_id = db.add_alert(
            req.title,
            req.description,
            req.severity.value,
            event_id=req.event_id,
            zone=req.zone,
        )
        return {"status": "success", "message": "Alert generated.", "id": alert_id}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Alert creation failed: {str(exc)}") from exc


@router.post("/auto-alerts/{event_id}")
@limiter.limit("30/minute")
def auto_generate_alerts(request: Request, event_id: str):
    try:
        smart_alert = alert_generator(event_id)
        alert_id = db.add_alert(
            smart_alert["title"],
            smart_alert["description"],
            smart_alert["severity"],
            event_id=event_id,
            zone=smart_alert.get("zone"),
            type=smart_alert.get("type"),
            velocity=smart_alert.get("velocity"),
            eta_to_critical_seconds=smart_alert.get("eta_to_critical_seconds"),
        )
        smart_alert["id"] = alert_id
        return {"status": "success", "alerts_generated": 1, "alerts": [smart_alert]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Auto-alert generation failed: {str(exc)}") from exc


@router.delete("/alerts/{alert_id}")
def resolve_alert(alert_id: str, event_id: Optional[str] = None):
    try:
        db.resolve_alert(alert_id, event_id)
        return {"status": "success", "message": "Alert resolved."}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Alert resolution failed: {str(exc)}") from exc


@router.get("/user-tickets/{user_id}")
def get_user_tickets(user_id: str):
    try:
        return {"tickets": db.get_user_tickets(user_id)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tickets: {str(exc)}") from exc


@router.get("/verify-ticket/{ticket_id}")
def verify_ticket(ticket_id: str):
    try:
        ticket = db.verify_ticket(ticket_id)
        if ticket:
            return {"valid": True, "ticket": ticket}
        raise HTTPException(status_code=404, detail="Invalid ticket ID")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Ticket verification failed: {str(exc)}") from exc


@router.post("/verify-host")
@limiter.limit("30/minute")
def verify_host_route(request: Request, req: VerifyHostRequest):
    try:
        is_valid = db.legacy_verify_host(req.event_id, req.host_id)
        if is_valid:
            return {"valid": True}
        raise HTTPException(status_code=403, detail="Invalid Host ID for this event")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Host verification failed: {str(exc)}") from exc


@router.get("/me")
def me(role: Optional[str] = None, uid: str = Depends(get_current_uid)):
    user = db.ensure_user(uid, role=role)
    return {"role": user.get("role", "fan"), "assignedEvents": user.get("assignedEvents", [])}


@router.put("/preferences")
@limiter.limit("30/minute")
def save_preferences(
    request: Request,
    payload: PreferencesPayload,
    authorization: Optional[str] = Header(default=None),
    x_user_id: Optional[str] = Header(default=None),
):
    uid = payload.uid or _uid_from_headers(authorization, x_user_id)
    preferences = db.save_preferences(uid, {"notifications": payload.notifications, "sound": payload.sound})
    return {"status": "success", "preferences": preferences}


@router.post("/chat")
@limiter.limit("30/minute")
def chat(request: Request, payload: ChatRequest):
    state = get_latest_state(payload.event_id)
    user_message = payload.message.strip()
    fallback = _fallback_chat_answer(user_message, state)

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {"answer": fallback}

    try:
        client = OpenAI(api_key=api_key)
        completion = client.chat.completions.create(
            model=os.environ.get("OPENAI_CHAT_MODEL", "gpt-4o-mini"),
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are NexBot, a concise stadium assistant. Answer under 60 words. "
                        f"Live state: {state}"
                    ),
                },
                {"role": "user", "content": user_message},
            ],
            max_tokens=90,
            temperature=0.2,
        )
        answer = completion.choices[0].message.content or fallback
        return {"answer": " ".join(answer.split()[:60])}
    except Exception:
        return {"answer": fallback}


def _fallback_chat_answer(message: str, state: Dict[str, Any]) -> str:
    lowered = message.lower()
    densities = state.get("densities", {})
    waits = state.get("wait_times", {})
    concessions = state.get("concessions", {})

    if "food" in lowered or "queue" in lowered or "concession" in lowered:
        best = min(concessions, key=concessions.get) if concessions else "drinks"
        return f"Shortest food queue is {best.replace('_', ' ')} at {concessions.get(best, 4)} minutes. Order now for fastest pickup."
    if "alert" in lowered or "surge" in lowered:
        surge = state.get("surge_warning")
        if surge:
            return f"{surge['title']}: {surge['description']}"
        return "No critical live surge is active right now. Keep following gate recommendations."
    best_gate = min(waits, key=waits.get) if waits else (min(densities, key=densities.get) if densities else "Gate B")
    wait = waits.get(best_gate, 8)
    return f"Best gate now is {best_gate} with an estimated {wait} minute wait. Avoid the busiest zone if signage changes."

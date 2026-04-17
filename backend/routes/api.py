from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.db import firebase_db as db
from services.simulation import (
    compute_crowd_density,
    get_wait_time,
    recommendations,
    alert_generator
)

router = APIRouter()

class AlertRequest(BaseModel):
    title: str
    description: str
    severity: str = "high"


@router.get("/events")
def get_events():
    """Returns list of all stadium events."""
    try:
        return {"events": db.get_events()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch events: {str(e)}")


@router.get("/crowd/{event_id}")
def get_crowd(event_id: str):
    """Returns simulated crowd density heatmap for an event."""
    try:
        density = compute_crowd_density(event_id)
        return {"event_id": event_id, "heat_map": density}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crowd data error: {str(e)}")


@router.get("/wait-time/{event_id}")
def get_wait_times(event_id: str):
    """Returns wait time predictions based on crowd density."""
    try:
        wait_times = get_wait_time(event_id)
        return {"event_id": event_id, "wait_times": wait_times}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Wait time error: {str(e)}")


@router.get("/recommend/{event_id}")
def get_recommendation(event_id: str):
    """Returns AI-recommended best gate with instructions."""
    try:
        recommendation = recommendations(event_id)
        return {"event_id": event_id, "recommendation": recommendation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")


@router.get("/alerts")
def get_alerts():
    """Returns all security alerts."""
    try:
        return {"alerts": db.get_alerts()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")


@router.post("/generate-alert")
def generate_alert(req: AlertRequest):
    """Generates a new security alert (manual from host dashboard)."""
    try:
        db.add_alert(req.title, req.description, req.severity)
        return {"status": "success", "message": "Alert generated."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alert creation failed: {str(e)}")


@router.post("/auto-alerts/{event_id}")
def auto_generate_alerts(event_id: str):
    """AI auto-generates alerts based on current crowd density."""
    try:
        smart_alert = alert_generator(event_id)
        db.add_alert(smart_alert["title"], smart_alert["description"], smart_alert["severity"])
        return {"status": "success", "alerts_generated": 1, "alerts": [smart_alert]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-alert generation failed: {str(e)}")


@router.delete("/alerts/{alert_id}")
def resolve_alert(alert_id: str):
    """Marks a security alert as resolved."""
    try:
        db.resolve_alert(alert_id)
        return {"status": "success", "message": "Alert resolved."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alert resolution failed: {str(e)}")


@router.get("/user-tickets/{user_id}")
def get_user_tickets(user_id: str):
    """Returns all tickets for a user."""
    try:
        return {"tickets": db.get_user_tickets(user_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tickets: {str(e)}")


@router.get("/verify-ticket/{ticket_id}")
def verify_ticket(ticket_id: str):
    """Validates a ticket ID."""
    try:
        ticket = db.verify_ticket(ticket_id)
        if ticket:
            return {"valid": True, "ticket": ticket}
        else:
            raise HTTPException(status_code=404, detail="Invalid ticket ID")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ticket verification failed: {str(e)}")


class VerifyHostRequest(BaseModel):
    event_id: str
    host_id: str

@router.post("/verify-host")
def verify_host(req: VerifyHostRequest):
    """Validates host access for an event."""
    try:
        is_valid = db.verify_host(req.event_id, req.host_id)
        if is_valid:
            return {"valid": True}
        else:
            raise HTTPException(status_code=403, detail="Invalid Host ID for this event")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Host verification failed: {str(e)}")

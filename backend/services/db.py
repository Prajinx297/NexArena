import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import firebase_admin
from firebase_admin import credentials, firestore

logger = logging.getLogger(__name__)

_db_client: firestore.Client | None = None


def ensure_firebase_initialized() -> None:
    if firebase_admin._apps:
        return

    credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if credentials_path:
        cred = credentials.Certificate(credentials_path)
    else:
        cred = credentials.ApplicationDefault()

    firebase_admin.initialize_app(cred)


def get_firestore_client() -> firestore.Client:
    global _db_client
    if _db_client is None:
      ensure_firebase_initialized()
      _db_client = firestore.client()
    return _db_client


class Database:
    @property
    def db(self):
        return get_firestore_client()

    def add_alert(self, title: str, description: str, severity: str = "high", event_id: str = "global", **extra: Any):
        alert_ref = self.db.collection("events").document(event_id).collection("alerts").document()
        alert_ref.set({
            "title": title,
            "description": description,
            "severity": severity,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_id": event_id,
            **extra,
        })
        return alert_ref.id

    def save_alert(self, title: str, description: str, severity: str = "high", event_id: str = "global", **extra: Any):
        return self.add_alert(title, description, severity, event_id, **extra)

    def get_alerts(self, event_id: Optional[str] = None):
        alerts = []
        if event_id:
            docs = (
                self.db.collection("events")
                .document(event_id)
                .collection("alerts")
                .order_by("timestamp", direction=firestore.Query.DESCENDING)
                .limit(20)
                .stream()
            )
        else:
            docs = (
                self.db.collection_group("alerts")
                .order_by("timestamp", direction=firestore.Query.DESCENDING)
                .limit(20)
                .stream()
            )

        for doc in docs:
            alert = doc.to_dict()
            alert["id"] = doc.id
            alerts.append(alert)
        return alerts

    def resolve_alert(self, alert_id: str, event_id: Optional[str] = None):
        if event_id:
            self.db.collection("events").document(event_id).collection("alerts").document(alert_id).delete()
            return True

        docs = self.db.collection_group("alerts").where("__name__", "==", alert_id).limit(1).stream()
        for doc in docs:
            doc.reference.delete()
            return True
        return False

    def get_events(self):
        events = []
        docs = self.db.collection("events").stream()
        for doc in docs:
            event = doc.to_dict()
            event["id"] = doc.id
            events.append(event)
        return events

    def get_event(self, event_id: str):
        doc_ref = self.db.collection("events").document(event_id)
        doc = doc_ref.get()
        if doc.exists:
            event = doc.to_dict()
            event["id"] = doc.id
            return event
        return None

    def get_user_tickets(self, user_id: str):
        tickets = []
        docs = self.db.collection("tickets").where("user_id", "==", user_id).stream()
        for doc in docs:
            ticket = doc.to_dict()
            ticket["id"] = doc.id
            tickets.append(ticket)
        return tickets

    def verify_ticket(self, ticket_id: str):
        doc_ref = self.db.collection("tickets").document(ticket_id)
        doc = doc_ref.get()
        if doc.exists:
            ticket = doc.to_dict()
            ticket["id"] = doc.id
            return ticket
        return None

    def ensure_user(self, uid: str, email: Optional[str] = None, role: Optional[str] = None):
        user_ref = self.db.collection("users").document(uid)
        doc = user_ref.get()
        if doc.exists:
            user = doc.to_dict()
            if role and role != user.get("role"):
                user["role"] = role
                updates = {"role": role}
                if role == "host" and not user.get("assignedEvents"):
                    user["assignedEvents"] = ["*"]
                    updates["assignedEvents"] = ["*"]
                user_ref.update(updates)
        else:
            final_role = role or "fan"
            assigned_events = ["*"] if final_role == "host" else []
            user = {"uid": uid, "email": email, "role": final_role, "assignedEvents": assigned_events}
            user_ref.set(user)
        user["uid"] = uid
        return user

    def get_user(self, uid: str):
        doc = self.db.collection("users").document(uid).get()
        if doc.exists:
            user = doc.to_dict()
            user["uid"] = uid
            user.setdefault("role", "fan")
            user.setdefault("assignedEvents", [])
            return user
        return None

    def verify_host_access(self, uid: str, event_id: Optional[str] = None):
        user = self.get_user(uid)
        if not user or user.get("role") != "host":
            return False
        assigned_events = user.get("assignedEvents") or []
        return event_id is None or "*" in assigned_events or event_id in assigned_events

    def legacy_verify_host(self, event_id: str, host_id: str):
        doc_ref = self.db.collection("hosts").document(host_id)
        doc = doc_ref.get()
        if doc.exists:
            host_data = doc.to_dict()
            if host_data.get("event_id") == event_id:
                return True
        return False

    def save_preferences(self, uid: str, preferences: Dict[str, Any]):
        pref_ref = self.db.collection("user_preferences").document(uid)
        pref_ref.set({"uid": uid, **preferences, "updatedAt": datetime.now(timezone.utc).isoformat()}, merge=True)
        return pref_ref.get().to_dict()

    def get_preferences(self, uid: str):
        doc = self.db.collection("user_preferences").document(uid).get()
        if doc.exists:
            return doc.to_dict()
        return {"uid": uid, "notifications": True, "sound": False}


firebase_db = Database()

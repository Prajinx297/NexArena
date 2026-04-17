import os
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase Admin
current_dir = os.path.dirname(os.path.abspath(__file__))
key_path = os.path.join(current_dir, "..", "serviceAccountKey.json")

# Ensure it's not initialized multiple times
if not firebase_admin._apps:
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

class Database:
    def __init__(self):
        self.db = db

    # Alerts
    def add_alert(self, title: str, description: str, severity: str = "high"):
        alert_ref = self.db.collection('alerts').document()
        alert_ref.set({
            "title": title,
            "description": description,
            "severity": severity,
            "timestamp": datetime.now().isoformat()
        })
        return alert_ref.id

    def get_alerts(self):
        alerts = []
        # Get latest 20 alerts
        docs = self.db.collection('alerts').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(20).stream()
        for doc in docs:
            alert = doc.to_dict()
            alert['id'] = doc.id
            alerts.append(alert)
        return alerts

    def resolve_alert(self, alert_id: str):
        self.db.collection('alerts').document(alert_id).delete()
        return True

    # Events
    def get_events(self):
        events = []
        docs = self.db.collection('events').stream()
        for doc in docs:
            event = doc.to_dict()
            event['id'] = doc.id
            events.append(event)
        return events

    def get_event(self, event_id: str):
        doc_ref = self.db.collection('events').document(event_id)
        doc = doc_ref.get()
        if doc.exists:
            event = doc.to_dict()
            event['id'] = doc.id
            return event
        return None

    # Tickets
    def get_user_tickets(self, user_id: str):
        tickets = []
        docs = self.db.collection('tickets').where('user_id', '==', user_id).stream()
        for doc in docs:
            ticket = doc.to_dict()
            ticket['id'] = doc.id
            tickets.append(ticket)
        return tickets

    def verify_ticket(self, ticket_id: str):
        doc_ref = self.db.collection('tickets').document(ticket_id)
        doc = doc_ref.get()
        if doc.exists:
            ticket = doc.to_dict()
            ticket['id'] = doc.id
            return ticket
        return None

    # Hosts
    def verify_host(self, event_id: str, host_id: str):
        doc_ref = self.db.collection('hosts').document(host_id)
        doc = doc_ref.get()
        if doc.exists:
            host_data = doc.to_dict()
            if host_data.get('event_id') == event_id:
                return True
        return False

firebase_db = Database()

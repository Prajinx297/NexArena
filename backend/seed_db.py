import logging

from services.db import get_firestore_client

logger = logging.getLogger(__name__)


def seed_database():
    firestore_client = get_firestore_client()
    events = [
        {
            "id": "camp-nou",
            "name": "El Clásico - FC Barcelona vs Real Madrid",
            "stadium": "Camp Nou",
            "city": "Barcelona, Spain",
            "date": "May 10, 2026",
            "capacity": "99,354",
            "image": "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000&auto=format&fit=crop",
            "status": "Live Now"
        },
        {
            "id": "wembley",
            "name": "Champions League Final",
            "stadium": "Wembley Stadium",
            "city": "London, England",
            "date": "May 28, 2026",
            "capacity": "90,000",
            "image": "https://images.unsplash.com/photo-1574629810360-7efbc1926768?q=80&w=2000&auto=format&fit=crop",
            "status": "Upcoming"
        },
        {
            "id": "old-trafford",
            "name": "Premier League - Man United vs Liverpool",
            "stadium": "Old Trafford",
            "city": "Manchester, England",
            "date": "June 15, 2026",
            "capacity": "74,310",
            "image": "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=2000&auto=format&fit=crop",
            "status": "Upcoming"
        }
    ]

    logger.info("Seeding events to Firestore...")
    for event in events:
        doc_id = event.pop("id")
        doc_ref = firestore_client.collection('events').document(doc_id)
        doc_ref.set(event)
        logger.info("Added event %s with ID %s", event["name"], doc_id)

    hosts = [
        {
            "id": "HOST-CAMP-NOU",
            "event_id": "camp-nou",
            "name": "Admin Camp Nou"
        },
        {
            "id": "HOST-WEMBLEY",
            "event_id": "wembley",
            "name": "Admin Wembley"
        }
    ]

    logger.info("Seeding hosts to Firestore...")
    for host in hosts:
        doc_id = host.pop("id")
        doc_ref = firestore_client.collection('hosts').document(doc_id)
        doc_ref.set(host)
        logger.info("Added host %s with ID %s", host["name"], doc_id)

    tickets = [
        {
            "id": "TICKET-1234",
            "user_id": "test_user_id",
            "event_id": "camp-nou",
            "seat": "A12",
            "gate": "Gate 3",
            "status": "valid"
        },
        {
            "id": "TICKET-5678",
            "user_id": "test_user_id",
            "event_id": "wembley",
            "seat": "V1",
            "gate": "VIP Entry",
            "status": "valid"
        }
    ]

    logger.info("Seeding tickets to Firestore...")
    for ticket in tickets:
        doc_id = ticket.pop("id")
        doc_ref = firestore_client.collection('tickets').document(doc_id)
        doc_ref.set(ticket)
        logger.info("Added ticket ID %s to event %s", doc_id, ticket["event_id"])


if __name__ == "__main__":
    logging.basicConfig(level="INFO")
    seed_database()

import json
from services.db import db as firestore_client

def seed_database():
    events = [
        {
            "id": "camp-nou",
            "name": "El Clásico — FC Barcelona vs Real Madrid",
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
            "name": "Premier League — Man United vs Liverpool",
            "stadium": "Old Trafford",
            "city": "Manchester, England",
            "date": "June 15, 2026",
            "capacity": "74,310",
            "image": "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=2000&auto=format&fit=crop",
            "status": "Upcoming"
        }
    ]

    print("Seeding events to Firestore...")
    for event in events:
        doc_id = event.pop("id")
        doc_ref = firestore_client.collection('events').document(doc_id)
        doc_ref.set(event)
        print(f"Added event: {event['name']} with ID {doc_id}")

    print("Database seeding completed successfully.")

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

    print("Seeding hosts to Firestore...")
    for host in hosts:
        doc_id = host.pop("id")
        doc_ref = firestore_client.collection('hosts').document(doc_id)
        doc_ref.set(host)
        print(f"Added host: {host['name']} with ID {doc_id}")

    tickets = [
        {
            "id": "TICKET-1234",
            "user_id": "test_user_id", # We will use a generic one or assume the mocked user is "test_user_id"
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
    
    # We also need a known user id to test with. Or just query by user id used in the app.
    # The frontend uses Firebase auth, so user ids are dynamic.
    # But for a specific ticket login, the user types the ticket ID.
    
    print("Seeding tickets to Firestore...")
    for ticket in tickets:
        doc_id = ticket.pop("id")
        doc_ref = firestore_client.collection('tickets').document(doc_id)
        doc_ref.set(ticket)
        print(f"Added ticket ID {doc_id} to event {ticket['event_id']}")

if __name__ == "__main__":
    seed_database()

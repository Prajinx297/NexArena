import os
import sys
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient


BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


import main  # noqa: E402
from routes import api as api_routes  # noqa: E402


class NexArenaApiTests(unittest.TestCase):
    def _client(self):
        startup_patches = [
            patch.object(main, "ensure_firebase_initialized", return_value=None),
            patch.object(main, "start_simulation_loop", return_value=None),
        ]
        for startup_patch in startup_patches:
            startup_patch.start()
            self.addCleanup(startup_patch.stop)
        return TestClient(main.app)

    def test_health_endpoint_returns_healthy_payload(self):
        with self._client() as client:
            response = client.get("/health")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "healthy")
        self.assertIn("timestamp", payload)

    def test_events_endpoint_returns_events_and_tracks_them(self):
        sample_events = [
            {"id": "camp-nou", "name": "El Clasico"},
            {"id": "wembley", "name": "Champions League Final"},
        ]

        with patch.object(api_routes.db, "get_events", return_value=sample_events), patch.object(
            api_routes, "track_event"
        ) as track_event:
            with self._client() as client:
                response = client.get("/api/events")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["events"], sample_events)
        self.assertEqual(track_event.call_count, 2)
        track_event.assert_any_call("camp-nou")
        track_event.assert_any_call("wembley")

    def test_events_endpoint_returns_500_when_storage_fails(self):
        with patch.object(api_routes.db, "get_events", side_effect=RuntimeError("storage offline")):
            with self._client() as client:
                response = client.get("/api/events")

        self.assertEqual(response.status_code, 500)
        self.assertIn("Failed to fetch events", response.json()["detail"])

    def test_chat_endpoint_uses_fallback_when_openai_key_is_missing(self):
        live_state = {
            "densities": {"Gate B": 22, "Gate C": 47},
            "wait_times": {"Gate B": 4, "Gate C": 9},
            "concessions": {"drinks": 3, "food_court": 7},
        }

        with patch.object(api_routes, "get_latest_state", return_value=live_state), patch.dict(os.environ, {}, clear=False):
            os.environ.pop("OPENAI_API_KEY", None)
            with self._client() as client:
                response = client.post("/api/chat", json={"event_id": "camp-nou", "message": "Best gate now?"})

        self.assertEqual(response.status_code, 200)
        self.assertIn("Gate B", response.json()["answer"])

    def test_uid_header_short_circuits_token_validation(self):
        uid = api_routes._uid_from_headers(None, "fan-123")
        self.assertEqual(uid, "fan-123")


if __name__ == "__main__":
    unittest.main()

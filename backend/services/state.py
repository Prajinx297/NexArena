import asyncio
from typing import Any, Dict, Iterable, Set

from services.simulation import build_simulation_state

latest_state: Dict[str, Dict[str, Any]] = {}
tracked_event_ids: Set[str] = set()
simulation_task: asyncio.Task | None = None


def track_event(event_id: str) -> None:
    tracked_event_ids.add(event_id)
    latest_state.setdefault(event_id, build_simulation_state(event_id))


async def simulation_loop() -> None:
    while True:
        for event_id in list(tracked_event_ids or {"default"}):
            latest_state[event_id] = build_simulation_state(event_id)
        await asyncio.sleep(3)


def start_simulation_loop() -> None:
    global simulation_task
    if simulation_task is None or simulation_task.done():
        simulation_task = asyncio.create_task(simulation_loop())


def get_latest_state(event_id: str) -> Dict[str, Any]:
    track_event(event_id)
    return latest_state[event_id]


def seed_events(event_ids: Iterable[str]) -> None:
    for event_id in event_ids:
        track_event(event_id)

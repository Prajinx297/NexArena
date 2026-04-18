import math
import random
from collections import defaultdict, deque
from datetime import datetime, timezone
from typing import Any, Deque, Dict, List, Optional

time_factors: Dict[str, float] = {}
density_history: Dict[str, Deque[Dict[str, int]]] = defaultdict(lambda: deque(maxlen=3))
last_surge_alert_at: Dict[str, float] = {}

GATES = [
    "Gate A (North)",
    "Gate B (North-East)",
    "Gate C (East)",
    "Gate D (South-East)",
    "Gate E (South)",
    "Gate F (South-West)",
    "Gate G (West)",
    "Gate H (North-West)",
]

CONCESSIONS = ["hot_dogs", "drinks", "merch"]


def _advance_time(event_id: str) -> float:
    if event_id not in time_factors:
        time_factors[event_id] = random.uniform(0, 2 * math.pi)
    time_factors[event_id] += 0.1
    return time_factors[event_id]


def _get_current_densities(event_id: str) -> Dict[str, int]:
    if event_id not in time_factors:
        time_factors[event_id] = random.uniform(0, 2 * math.pi)

    tf = time_factors[event_id]
    densities = {}
    for gate in GATES:
        phase_shift = (hash(gate) % 100) / 100.0 * 2 * math.pi
        base = 40 + 30 * math.sin(tf + phase_shift) + random.gauss(0, 3)
        densities[gate] = max(0, min(100, int(base)))
    return densities


def compute_crowd_density(event_id: str) -> Dict[str, int]:
    _advance_time(event_id)
    densities = _get_current_densities(event_id)
    density_history[event_id].append(densities)
    return densities


def calculate_wait_times(crowd_density: Dict[str, int]) -> Dict[str, int]:
    return {
        gate: max(1, int(density / 9) + int(random.gauss(0, 1)))
        for gate, density in crowd_density.items()
    }


def get_wait_time(event_id: str) -> Dict[str, int]:
    return calculate_wait_times(_get_current_densities(event_id))


def get_concession_waits(event_id: str) -> Dict[str, int]:
    if event_id not in time_factors:
        time_factors[event_id] = random.uniform(0, 2 * math.pi)
    tf = time_factors[event_id]
    waits = {}
    for index, key in enumerate(CONCESSIONS):
        value = 8 + 6 * math.sin(tf + index * 1.35) + random.gauss(0, 0.8)
        waits[key] = max(2, min(18, int(value)))
    return waits


def recommendations(event_id: str) -> List[Dict[str, Any]]:
    densities = _get_current_densities(event_id)
    least_congested = min(densities, key=densities.get)
    most_congested = max(densities, key=densities.get)

    return [
        {
            "type": "navigation",
            "title": f"Optimal Entry: {least_congested}",
            "reason": f"Currently shows the lowest crowd density ({densities[least_congested]}%).",
            "confidence_percent": random.randint(75, 95),
            "recommended_gate": least_congested,
            "instruction": f"Use {least_congested}; it is the clearest route right now.",
        },
        {
            "type": "food",
            "title": "Concession Stand Near East Gate",
            "reason": "Wait times are shorter than the main concourse.",
            "confidence_percent": random.randint(75, 95),
        },
        {
            "type": "safety",
            "title": f"Avoid {most_congested}",
            "reason": f"Experiencing high traffic ({densities[most_congested]}%). Use an alternate route.",
            "confidence_percent": random.randint(75, 95),
        },
    ]


def get_surge_warning(event_id: str) -> Optional[Dict[str, Any]]:
    history = density_history[event_id]
    if len(history) < 3:
        return None

    newest = history[-1]
    oldest = history[0]
    surge_candidates = []
    for gate, density in newest.items():
        velocity = density - oldest.get(gate, density)
        if density > 55 and velocity > 6:
            ticks_to_critical = max(1, math.ceil((85 - density) / max(velocity, 1)))
            surge_candidates.append((gate, density, velocity, ticks_to_critical))

    if not surge_candidates:
        return None

    gate, density, velocity, ticks_to_critical = max(surge_candidates, key=lambda item: item[2])
    now_ts = datetime.now(timezone.utc).timestamp()
    if now_ts - last_surge_alert_at.get(f"{event_id}:{gate}", 0) < 18:
        return None
    last_surge_alert_at[f"{event_id}:{gate}"] = now_ts

    return {
        "title": f"Surge Warning at {gate}",
        "description": f"Density is {density}% and rising {velocity}% per tick. Estimated critical threshold in {ticks_to_critical * 3} seconds.",
        "severity": "high",
        "zone": gate,
        "type": "surge",
        "velocity": velocity,
        "eta_to_critical_seconds": ticks_to_critical * 3,
    }


def alert_generator(event_id: str) -> Dict[str, Any]:
    surge = get_surge_warning(event_id)
    if surge:
        return surge

    densities = _get_current_densities(event_id)
    high_density_zones = {key: value for key, value in densities.items() if value > 75}
    critical_zones = {key: value for key, value in densities.items() if value > 85}

    alerts_pool = [
        {"title": "Medical Assistance Needed", "description": "Minor incident reported, medical team en route.", "severity": "high"},
        {"title": "Lost Child", "description": "A minor is waiting at the central security desk.", "severity": "medium"},
        {"title": "Spill on Concourse", "description": "Custodial staff requested at Level 2.", "severity": "low"},
        {"title": "Weather Warning", "description": "Light rain expected in 15 minutes. Retractable roof closing.", "severity": "info"},
        {"title": "VIP Arrival", "description": "Expected VIP arrival at South Gate. Keep lane clear.", "severity": "info"},
        {"title": "Elevator Malfunction", "description": "Elevator 4 is out of service. Maintenance notified.", "severity": "medium"},
        {"title": "Suspicious Package", "description": "Unattended bag found. Security team dispatched.", "severity": "critical"},
        {"title": "Equipment Failure", "description": "Turnstile 2 offline at North Gate.", "severity": "high"},
        {"title": "Merchandise Restock", "description": "Main store needs restock of large sizes.", "severity": "low"},
        {"title": "Restroom Cleaning", "description": "East concourse restrooms closed for scheduled cleaning.", "severity": "info"},
    ]

    if critical_zones:
        zone = random.choice(list(critical_zones.keys()))
        return {
            "title": f"Critical Overcrowding at {zone}",
            "description": f"Zone is at {critical_zones[zone]}% capacity. Redirect fans immediately.",
            "severity": "critical",
            "zone": zone,
        }

    if high_density_zones and random.random() < 0.7:
        zone = random.choice(list(high_density_zones.keys()))
        return {
            "title": f"High Traffic at {zone}",
            "description": f"Zone is approaching capacity ({high_density_zones[zone]}%). Deploy crowd managers.",
            "severity": "high",
            "zone": zone,
        }

    alert = random.choice(alerts_pool).copy()
    alert["zone"] = random.choice(GATES)
    return alert


def build_simulation_state(event_id: str) -> Dict[str, Any]:
    heat_map = compute_crowd_density(event_id)
    wait_times = calculate_wait_times(heat_map)
    concessions = get_concession_waits(event_id)
    surge_warning = get_surge_warning(event_id)

    return {
        "type": "crowd_update",
        "event_id": event_id,
        "heat_map": heat_map,
        "densities": heat_map,
        "wait_times": wait_times,
        "concessions": concessions,
        "surge_warning": surge_warning,
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }


def generate_smart_alert(crowd_density: dict):
    return [alert_generator("default")]

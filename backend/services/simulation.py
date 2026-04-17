import math
import random
from typing import Dict, List, Any

# Module-level dictionary to store time_factor per event_id
time_factors: Dict[str, float] = {}

GATES = [
    "Gate A (North)",
    "Gate B (North-East)",
    "Gate C (East)",
    "Gate D (South-East)",
    "Gate E (South)",
    "Gate F (South-West)",
    "Gate G (West)",
    "Gate H (North-West)"
]

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
    """
    AI-Like Simulation: Compute crowd density using a sinusoidal base + random noise.
    Returns density percentages (0-100) for 8 gates.
    """
    if event_id not in time_factors:
        time_factors[event_id] = random.uniform(0, 2 * math.pi)
    
    # advance time factor for the specific event
    time_factors[event_id] += 0.1
    return _get_current_densities(event_id)

def get_wait_time(event_id: str) -> Dict[str, int]:
    """
    AI-Like Simulation: Compute wait times based on current crowd density.
    Higher density = longer wait. Formula: wait = max(1, int(density / 10) + random.gauss(0, 1))
    """
    densities = _get_current_densities(event_id)
    wait_times = {}
    for gate, density in densities.items():
        wait_times[gate] = max(1, int(density / 10) + int(random.gauss(0, 1)))
    return wait_times

# Helper backwards compatibility
def calculate_wait_times(crowd_density: dict):
    wait_times = {}
    for gate, density in crowd_density.items():
        wait_times[gate] = max(1, int(density / 10) + int(random.gauss(0, 1)))
    return wait_times

def recommendations(event_id: str) -> List[Dict[str, Any]]:
    densities = _get_current_densities(event_id)
    least_congested = min(densities, key=densities.get)
    most_congested = max(densities, key=densities.get)
    
    recs = [
        {
            "type": "navigation",
            "title": f"Optimal Entry: {least_congested}",
            "reason": f"Currently shows the lowest crowd density ({densities[least_congested]}%).",
            "confidence_percent": random.randint(75, 95)
        },
        {
            "type": "food",
            "title": "Concession Stand Near East Gate",
            "reason": "Wait times are 40% shorter than the main concourse.",
            "confidence_percent": random.randint(75, 95)
        },
        {
            "type": "safety",
            "title": f"Avoid {most_congested}",
            "reason": f"Experiencing high traffic ({densities[most_congested]}%). Use an alternate route.",
            "confidence_percent": random.randint(75, 95)
        }
    ]
    return recs

def alert_generator(event_id: str) -> Dict[str, str]:
    densities = _get_current_densities(event_id)
    high_density_zones = {k: v for k, v in densities.items() if v > 75}
    critical_zones = {k: v for k, v in densities.items() if v > 85}
    
    alerts_pool = [
        {"title": "Medical Assistance Needed", "description": "Minor incident reported, medical team en route.", "severity": "high"},
        {"title": "Lost Child", "description": "A minor is waiting at the central security desk.", "severity": "medium"},
        {"title": "Spill on Concourse", "description": "Custodial staff requested at Level 2.", "severity": "low"},
        {"title": "Weather Warning", "description": "Light rain expected in 15 minutes. Retractable roof closing.", "severity": "info"},
        {"title": "VIP Arrival", "description": "Expected VIP arrival at South Gate. Keep lane clear.", "severity": "info"},
        {"title": "Elevator Malfunction", "description": "Elevator 4 is out of service. Maintenance notified.", "severity": "medium"},
        {"title": "Suspicious Package", "description": "Unattended bag found. Security team dispatched.", "severity": "critical"},
        {"title": "Equipment Failure", "description": "Turnstile 2 offline at North Gate.", "severity": "high"},
        {"title": "Merchandise Restock", "description": "Main store needs immediate restock of large sizes.", "severity": "low"},
        {"title": "Restroom Cleaning", "description": "East concourse restrooms closed for scheduled cleaning.", "severity": "info"}
    ]

    # Prioritize crowd-based alerts
    if critical_zones:
        zone = random.choice(list(critical_zones.keys()))
        return {
            "title": f"Critical Overcrowding at {zone}",
            "description": f"Zone is at {critical_zones[zone]}% capacity. Redirect fans immediately.",
            "severity": "critical",
            "zone": zone
        }
    
    if high_density_zones and random.random() < 0.7:
        zone = random.choice(list(high_density_zones.keys()))
        return {
            "title": f"High Traffic at {zone}",
            "description": f"Zone is approaching capacity ({high_density_zones[zone]}%). Deploy additional crowd managers.",
            "severity": "high",
            "zone": zone
        }

    # Otherwise, pick from pool
    alert = random.choice(alerts_pool)
    alert["zone"] = random.choice(GATES)
    return alert

# Helper backwards compatibility
def generate_smart_alert(crowd_density: dict):
    return [alert_generator("default")]

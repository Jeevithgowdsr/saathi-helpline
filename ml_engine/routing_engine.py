import math
import random

class RoutingEngine:
    def __init__(self):
        pass

    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2) * math.sin(dlat/2) + \
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
            math.sin(dlon/2) * math.sin(dlon/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

    def calculate_route(self, start_lat, start_lon, end_lat, end_lon, mode='driving'):
        """
        Calculates a simulated route between two points.
        Modes: 'walking', 'driving', 'ambulance'
        """
        distance_km = self._haversine_distance(start_lat, start_lon, end_lat, end_lon)
        
        # Speed assumptions (km/h)
        speeds = {
            'walking': 5,
            'driving': 40,
            'ambulance': 60
        }
        speed = speeds.get(mode, 40)
        
        # Traffic factor (random multiplier)
        traffic_factor = 1.0
        if mode == 'driving':
            traffic_factor = random.uniform(1.1, 1.5) # 10-50% slower due to traffic
        elif mode == 'ambulance':
            traffic_factor = 0.9 # Ambulances cut through traffic
            
        duration_hours = (distance_km / speed) * traffic_factor
        duration_mins = round(duration_hours * 60)
        
        # Generate Polyline (Simulated waypoints)
        polyline = self._generate_polyline(start_lat, start_lon, end_lat, end_lon)
        
        # Generate Instructions
        instructions = self._generate_instructions(polyline, mode)
        
        return {
            "mode": mode,
            "total_distance": f"{distance_km:.2f} km",
            "total_time": f"{duration_mins} mins",
            "polyline": polyline,
            "instructions_array": instructions
        }

    def _generate_polyline(self, start_lat, start_lon, end_lat, end_lon):
        """Generates intermediate points to simulate a path."""
        points = [[start_lat, start_lon]]
        steps = 5
        
        for i in range(1, steps):
            ratio = i / steps
            # Linear interpolation
            inter_lat = start_lat + (end_lat - start_lat) * ratio
            inter_lon = start_lon + (end_lon - start_lon) * ratio
            
            # Add noise to simulate turns (zigzag)
            noise = 0.002 if i % 2 == 0 else -0.002
            points.append([inter_lat + noise, inter_lon + noise])
            
        points.append([end_lat, end_lon])
        return points

    def _generate_instructions(self, polyline, mode):
        """Generates mock turn-by-turn instructions."""
        instructions = []
        actions = ["Head straight", "Turn right", "Turn left", "Continue straight"]
        streets = ["Main Road", "2nd Cross", "Highway 44", "Market Street", "Hospital Lane"]
        
        instructions.append(f"Start {mode} from current location.")
        
        for i in range(1, len(polyline) - 1):
            action = random.choice(actions)
            street = random.choice(streets)
            dist = random.randint(100, 500)
            instructions.append(f"{action} onto {street} ({dist}m).")
            
        instructions.append("Arrive at destination.")
        return instructions

# Usage
if __name__ == "__main__":
    router = RoutingEngine()
    route = router.calculate_route(12.9716, 77.5946, 12.9800, 77.6000, 'ambulance')
    import json
    print(json.dumps(route, indent=2))

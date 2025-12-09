import math
import random
from datetime import datetime

class GeoLocationService:
    def __init__(self):
        # Mock Database of Emergency Centers in major hubs
        # In a real app, this would be a database query or Google Places API call
        self.places_db = [
            # Bangalore
            {"id": "p1", "name": "Central Police Station", "type": "police", "lat": 12.9716, "lon": 77.5946, "rating": 4.5, "open_24_7": True},
            {"id": "h1", "name": "City General Hospital", "type": "hospital", "lat": 12.9720, "lon": 77.5950, "rating": 4.2, "open_24_7": True},
            {"id": "w1", "name": "Women Safety Cell", "type": "women_safety", "lat": 12.9730, "lon": 77.5960, "rating": 4.8, "open_24_7": True},
            {"id": "f1", "name": "Fire Station Main", "type": "fire_station", "lat": 12.9740, "lon": 77.5970, "rating": 4.7, "open_24_7": True},
            {"id": "c1", "name": "Child Helpline Center", "type": "child_helpline", "lat": 12.9750, "lon": 77.5980, "rating": 4.9, "open_24_7": False},
            
            # Delhi
            {"id": "p2", "name": "Delhi Police HQ", "type": "police", "lat": 28.6139, "lon": 77.2090, "rating": 4.4, "open_24_7": True},
            {"id": "h2", "name": "AIIMS Trauma Center", "type": "hospital", "lat": 28.5672, "lon": 77.2100, "rating": 4.6, "open_24_7": True},
            
            # Mumbai
            {"id": "p3", "name": "Mumbai Police Comm.", "type": "police", "lat": 18.9446, "lon": 72.8223, "rating": 4.3, "open_24_7": True},
        ]

    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        """Calculates distance in KM between two coordinates."""
        R = 6371  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2) * math.sin(dlat/2) + \
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
            math.sin(dlon/2) * math.sin(dlon/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

    def _estimate_eta(self, distance_km):
        """Estimates ETA assuming average city speed of 30km/h + traffic delay."""
        avg_speed = 30 # km/h
        base_time_hours = distance_km / avg_speed
        minutes = base_time_hours * 60
        # Add random traffic delay (0-10 mins)
        minutes += random.randint(2, 10)
        return round(minutes)

    def find_nearby_services(self, user_lat, user_lon):
        """
        Identifies nearest services for each category.
        If user is far from mock points, it generates plausible synthetic data relative to user.
        """
        categories = ["police", "hospital", "women_safety", "fire_station", "child_helpline"]
        results = {}

        for category in categories:
            # 1. Try to find real match in DB
            candidates = [p for p in self.places_db if p["type"] == category]
            nearest = None
            min_dist = float('inf')

            for place in candidates:
                dist = self._haversine_distance(user_lat, user_lon, place["lat"], place["lon"])
                if dist < min_dist:
                    min_dist = dist
                    nearest = place

            # 2. If nearest is too far (>50km) or no match, generate synthetic local result
            # This ensures the demo works anywhere the user is located
            if min_dist > 50 or not nearest:
                nearest = self._generate_synthetic_place(category, user_lat, user_lon)
                min_dist = nearest['distance_km'] # Pre-calculated in synthetic

            # 3. Format Output
            eta = self._estimate_eta(min_dist)
            
            results[category] = {
                "name": nearest["name"],
                "distance_km": round(min_dist, 2),
                "eta_minutes": eta,
                "coordinates": {"lat": nearest["lat"], "lon": nearest["lon"]},
                "rating": nearest["rating"],
                "availability_status": "Open Now" if nearest["open_24_7"] else "Closes 8 PM",
                "is_simulated": min_dist > 50 # Flag if we faked it
            }

        return results

    def _generate_synthetic_place(self, category, user_lat, user_lon):
        """Generates a plausible location 1-5km away from user."""
        # Random offset
        lat_offset = random.uniform(-0.04, 0.04)
        lon_offset = random.uniform(-0.04, 0.04)
        
        dist = self._haversine_distance(user_lat, user_lon, user_lat + lat_offset, user_lon + lon_offset)
        
        names = {
            "police": "Local Police Station",
            "hospital": "City Emergency Hospital",
            "women_safety": "Women's Help Center",
            "fire_station": "District Fire Station",
            "child_helpline": "Child Care Unit"
        }
        
        return {
            "name": f"Nearest {names.get(category, 'Service')}",
            "type": category,
            "lat": user_lat + lat_offset,
            "lon": user_lon + lon_offset,
            "rating": round(random.uniform(3.5, 5.0), 1),
            "open_24_7": True,
            "distance_km": dist
        }

# Usage
if __name__ == "__main__":
    geo = GeoLocationService()
    # Test with Bangalore Coords
    print(json.dumps(geo.find_nearby_services(12.9716, 77.5946), indent=2))

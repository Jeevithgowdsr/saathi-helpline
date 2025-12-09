import math

class RiskEngine:
    def __init__(self):
        # Mock Database of High-Risk Zones
        # In production, this would come from a live database or external API (e.g., weather API, crime stats)
        self.risk_zones = [
            {
                "id": "z1",
                "type": "crime_hotspot",
                "lat": 12.9716, 
                "lon": 77.5946, 
                "radius_km": 2.0, # Large radius to ensure detection for demo
                "severity": "high",
                "title": "High Crime Rate Area",
                "message": "Recent reports of snatch theft in this sector. Avoid walking alone at night."
            },
            {
                "id": "z2",
                "type": "accident_zone",
                "lat": 12.9800, 
                "lon": 77.6000, 
                "radius_km": 1.0,
                "severity": "medium",
                "title": "Accident Prone Junction",
                "message": "Black spot identified. Multiple accidents reported this month. Drive carefully."
            },
            {
                "id": "z3",
                "type": "women_safety",
                "lat": 12.9600, 
                "lon": 77.5800, 
                "radius_km": 1.5,
                "severity": "critical",
                "title": "Unsafe Zone Alert",
                "message": "Poor lighting reported in this area. Patrolling requested."
            },
            {
                "id": "z4",
                "type": "weather",
                "lat": 28.6139, 
                "lon": 77.2090, 
                "radius_km": 10.0,
                "severity": "warning",
                "title": "Heavy Smog Alert",
                "message": "Air Quality Index (AQI) is severe. Wear a mask."
            }
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

    def check_risks(self, user_lat, user_lon):
        """
        Checks if the user is inside any high-risk zones.
        Returns a list of active alerts.
        """
        active_alerts = []
        
        for zone in self.risk_zones:
            distance = self._haversine_distance(user_lat, user_lon, zone['lat'], zone['lon'])
            
            if distance <= zone['radius_km']:
                active_alerts.append({
                    "zone_id": zone['id'],
                    "type": zone['type'],
                    "severity": zone['severity'],
                    "title": zone['title'],
                    "message": zone['message'],
                    "distance_from_center_km": round(distance, 2)
                })
                
        return active_alerts

if __name__ == "__main__":
    engine = RiskEngine()
    # Test Bangalore
    print(engine.check_risks(12.9720, 77.5950))

import random
import time

class HeatmapEngine:
    def __init__(self):
        pass

    def generate_heatmap_data(self, center_lat, center_lon, radius_km=10):
        """
        Generates synthetic emergency report data for heatmap visualization.
        Inputs: Center coordinates and radius.
        Output: List of [lat, lon, intensity]
        """
        reports = []
        
        # Crisis types with associated base severity
        crisis_types = {
            "crime": 0.8,
            "accident": 0.6,
            "harassment": 0.9,
            "fire": 0.7,
            "medical": 0.5
        }
        
        # Generate 50-100 random reports
        num_reports = random.randint(50, 100)
        
        for _ in range(num_reports):
            # Random offset within radius (approx)
            # 1 deg lat ~ 111km
            offset_scale = radius_km / 111.0
            lat = center_lat + random.uniform(-offset_scale, offset_scale)
            lon = center_lon + random.uniform(-offset_scale, offset_scale)
            
            crisis = random.choice(list(crisis_types.keys()))
            base_severity = crisis_types[crisis]
            
            # Randomize severity slightly
            severity = min(1.0, base_severity + random.uniform(-0.1, 0.1))
            
            # Timestamp (last 24 hours)
            timestamp = time.time() - random.randint(0, 86400)
            
            reports.append({
                "lat": lat,
                "lon": lon,
                "intensity": severity,
                "type": crisis,
                "timestamp": timestamp
            })
            
        # Add some "hotspots" (clusters of high intensity)
        for _ in range(3):
            hotspot_lat = center_lat + random.uniform(-offset_scale/2, offset_scale/2)
            hotspot_lon = center_lon + random.uniform(-offset_scale/2, offset_scale/2)
            
            for _ in range(10):
                reports.append({
                    "lat": hotspot_lat + random.uniform(-0.002, 0.002),
                    "lon": hotspot_lon + random.uniform(-0.002, 0.002),
                    "intensity": 1.0, # Max intensity
                    "type": "cluster",
                    "timestamp": time.time()
                })
                
        return reports

if __name__ == "__main__":
    engine = HeatmapEngine()
    data = engine.generate_heatmap_data(12.9716, 77.5946)
    print(f"Generated {len(data)} points")

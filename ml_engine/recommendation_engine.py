import json
import math
import sys
import os

try:
    import torch
    from sentence_transformers import SentenceTransformer, util
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    print("⚠️ Torch/Sentence-Transformers not found. Using simple keyword matching.")
    TRANSFORMERS_AVAILABLE = False

class HelplineRecommender:
    def __init__(self, data_path=None):
        if data_path is None:
            # Default to helplines.json in the same directory as this script
            base_dir = os.path.dirname(os.path.abspath(__file__))
            data_path = os.path.join(base_dir, 'helplines.json')
            
        with open(data_path, 'r') as f:
            self.helplines = json.load(f)
        
        self.use_vector_search = False
        if TRANSFORMERS_AVAILABLE:
            print("🔄 Loading Embedding Model (all-MiniLM-L6-v2)...")
            try:
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
                
                # Pre-compute embeddings for all helplines
                # We combine name, keywords, and description for a rich semantic representation
                self.corpus_texts = [
                    f"{h['name']} {h['keywords']} {h['description']} {h['category']}" 
                    for h in self.helplines
                ]
                self.helpline_embeddings = self.model.encode(self.corpus_texts, convert_to_tensor=True)
                print("✅ Model loaded and embeddings computed.")
                self.use_vector_search = True
            except Exception as e:
                print(f"⚠️ Failed to load model: {e}. Falling back to keyword matching.")
        else:
            print("⚠️ Running in Lite Mode (No Embeddings).")

    def _tokenize(self, text):
        return set(text.lower().replace(',', '').split())

    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2) * math.sin(dlat/2) + \
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
            math.sin(dlon/2) * math.sin(dlon/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

    def recommend(self, user_message, location=None, emergency_type=None, history=None, user_lat=None, user_lon=None):
        print(f"🔍 Analyzing Request: '{user_message}'")
        print(f"📍 Location: {location}, 🚨 Type: {emergency_type}, 🌍 Coords: {user_lat}, {user_lon}")

        scores = []
        
        # 1. Calculate Semantic Similarity
        if self.use_vector_search:
            query_embedding = self.model.encode(user_message, convert_to_tensor=True)
            cos_scores = util.cos_sim(query_embedding, self.helpline_embeddings)[0]
        else:
            cos_scores = [0] * len(self.helplines)

        for idx, helpline in enumerate(self.helplines):
            # --- Base AI Score (0-10) ---
            if self.use_vector_search:
                similarity = float(cos_scores[idx])
                ai_score = similarity * 10
            else:
                content_text = helpline['keywords'] + " " + helpline['description']
                similarity = self._calculate_similarity_simple(user_message, content_text)
                ai_score = similarity * 10
            
            # --- Ranking Boosters ---
            boost_score = 0.0
            reasons = []

            # 1. Proximity Boosting
            distance_km = float('inf')
            if user_lat and user_lon and 'lat' in helpline:
                distance_km = self._haversine_distance(user_lat, user_lon, helpline['lat'], helpline['lon'])
                # Proximity Score: 1 / (1 + distance). Max 1.0 (at 0km), tends to 0.
                proximity_score = 1.0 / (1.0 + distance_km)
                boost_score += proximity_score * 5.0 # Weight: 5
                
                if distance_km < 5.0:
                    reasons.append(f"Nearby ({distance_km:.1f} km).")

            # 2. Availability Boosting
            if helpline.get('is_active', True):
                boost_score += 2.0 # Weight: 2
            else:
                reasons.append("Currently unavailable.")

            # 3. Success Rate Boosting
            success_rate = helpline.get('success_rate', 0.8)
            boost_score += success_rate * 2.0 # Weight: 2
            if success_rate > 0.95:
                reasons.append("High success rate.")

            # 4. Context Boosting
            if emergency_type and emergency_type.lower() in helpline['category'].lower():
                boost_score += 5.0
                reasons.append(f"Specializes in {helpline['category']}.")
            
            # 5. Keyword Match
            for word in self._tokenize(user_message):
                if word in helpline['keywords']:
                    boost_score += 1.0
                    break

            # Final Score
            final_score = ai_score + boost_score

            scores.append({
                "helpline": helpline,
                "score": final_score,
                "distance_km": round(distance_km, 2) if distance_km != float('inf') else None,
                "reason": " ".join(reasons) if reasons else "Recommended based on general relevance."
            })

        # Sort by score descending
        scores.sort(key=lambda x: x['score'], reverse=True)
        
        # Return Top 3
        return scores[:3]

    def _calculate_similarity_simple(self, text1, text2):
        tokens1 = self._tokenize(text1)
        tokens2 = self._tokenize(text2)
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        return len(intersection) / len(union) if union else 0

    def _generate_reason(self, helpline, similarity, emergency_type):
        # Deprecated by new logic inside loop
        pass

# --- Usage Example ---
if __name__ == "__main__":
    engine = HelplineRecommender()
    
    # Test Case 1: Mental Health
    print("\n--- Test Case 1 ---")
    results = engine.recommend(
        user_message="I feel very sad and want to end my life",
        location="Bangalore",
        emergency_type="Mental Health"
    )
    print(json.dumps(results, indent=2, default=str))

    # Test Case 2: Fire
    print("\n--- Test Case 2 ---")
    results = engine.recommend(
        user_message="There is a huge fire in the building!",
        location="Delhi",
        emergency_type="Fire"
    )
    print(json.dumps(results, indent=2, default=str))

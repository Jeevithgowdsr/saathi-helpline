import re
import logging

logger = logging.getLogger(__name__)

class ConversationEngine:
    def __init__(self, classifier, recommender):
        self.classifier = classifier
        self.recommender = recommender
        
        # Keywords for urgency detection
        self.urgency_keywords = [
            "help", "dying", "blood", "kill", "accident", "fire", "trapped", 
            "emergency", "urgent", "fast", "quick", "please", "hurt", "pain",
            "bachao", "madad", "kaapaathu", "save"
        ]
        
        # Strong keywords that should override classifier if present
        self.intent_keywords = {
            "fire_station": ["fire", "burn", "smoke", "flame", "explosion", "gas leak", "spark"],
            "women_safety": ["stalker", "harass", "rape", "abuse", "domestic", "husband", "follow", "touch", "molest"],
            "police": ["police", "thief", "robbery", "attack", "fight", "gun", "crime", "kill", "murder", "shoot", "stole", "kidnap"],
            "ambulance": ["ambulance", "hospital", "blood", "heart", "pain", "injury", "broken", "unconscious", "faint", "breath", "bleeding"],
        }

    def analyze_urgency(self, text):
        """
        Analyze text for urgency based on keywords and patterns.
        Returns a score 0.0 to 1.0.
        """
        text_lower = text.lower()
        score = 0.0
        
        # Keyword matching
        matches = sum(1 for word in self.urgency_keywords if word in text_lower)
        score += min(matches * 0.2, 0.8) # Cap at 0.8 from keywords
        
        # Repetition (e.g., "help help")
        if len(set(text_lower.split())) < len(text_lower.split()) * 0.6:
            score += 0.1
            
        # Exclamation marks (if present in STT)
        if "!" in text:
            score += 0.1
            
        return min(score, 1.0)

    def normalize_text(self, text):
        """
        Clean up broken speech, stutters, and fillers.
        """
        # Remove common fillers
        text = re.sub(r'\b(um|uh|ah|like|you know)\b', '', text, flags=re.IGNORECASE)
        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def _refine_intent(self, predicted_intent, text):
        """
        Cross-check classifier prediction with strong keywords.
        This helps correct bias (e.g., 'fire' being classified as 'ambulance').
        """
        text_lower = text.lower()
        
        # Check for strong keyword matches in other categories
        scores = {cat: 0 for cat in self.intent_keywords}
        
        for category, keywords in self.intent_keywords.items():
            for word in keywords:
                if word in text_lower:
                    scores[category] += 1
        
        # Find category with max keyword hits
        best_keyword_match = max(scores, key=scores.get)
        max_hits = scores[best_keyword_match]
        
        # If the classifier's choice has 0 keyword support, but another category has strong support, switch.
        if scores[predicted_intent] == 0 and max_hits > 0:
            logger.info(f"Overriding classifier ({predicted_intent}) with keyword match ({best_keyword_match})")
            return best_keyword_match
            
        # Specific overrides for critical keywords
        if "fire" in text_lower and predicted_intent != "fire_station":
            return "fire_station"
        if any(w in text_lower for w in ["rape", "stalker", "husband"]) and predicted_intent != "women_safety":
            return "women_safety"
        if any(w in text_lower for w in ["gun", "robber", "thief", "kill"]) and predicted_intent != "police":
            return "police"
            
        return predicted_intent

    def process_query(self, text, user_lat=None, user_lon=None):
        """
        Main method to process a user query.
        Handles broken language, detects intent, and formulates a response.
        """
        clean_text = self.normalize_text(text)
        urgency_score = self.analyze_urgency(clean_text)
        
        # 1. Classify Intent
        prediction = self.classifier.predict(clean_text)
        intent = prediction['label']
        confidence = prediction['confidence']
        
        # Refine intent using keywords to fix bias
        intent = self._refine_intent(intent, clean_text)
        
        # 2. Heuristic Fallback for Low Confidence / Incomplete Sentences
        if confidence < 0.4 and intent == prediction['label']: # Only fallback if refinement didn't already switch it
            logger.info(f"Low confidence ({confidence}). Attempting keyword fallback.")
            best_match = None
            max_hits = 0
            
            for category, keywords in self.intent_keywords.items():
                hits = sum(1 for k in keywords if k in clean_text.lower())
                if hits > max_hits:
                    max_hits = hits
                    best_match = category
            
            if best_match:
                intent = best_match
                confidence = 0.5 # Artificial confidence for fallback
                logger.info(f"Fallback selected: {intent}")
            else:
                # If still no match but high urgency, default to Police/General
                if urgency_score > 0.6:
                    intent = "police" # Default emergency
                else:
                    intent = "unknown"

        # 3. Get Recommendation
        helpline = None
        if intent != "unknown":
            recommendations = self.recommender.recommend(
                user_message=clean_text,
                location="India",
                emergency_type=intent,
                user_lat=user_lat,
                user_lon=user_lon
            )
            if recommendations:
                helpline = recommendations[0]['helpline']

        # 4. Generate Response based on Urgency and Intent
        response_text = self._generate_response(intent, urgency_score, helpline)
        
        return {
            "intent": intent,
            "confidence": confidence,
            "urgency": urgency_score,
            "helpline": helpline,
            "response": response_text
        }

    def _generate_response(self, intent, urgency, helpline):
        """
        Generate a spoken response tailored to the situation.
        Strictly follows safety protocols: No medical/legal/therapy advice.
        """
        safety_tip = ""
        if intent == "police":
            safety_tip = "Move to a safe location if possible."
        elif intent == "fire_station":
            safety_tip = "Evacuate immediately and stay low."
        elif intent == "ambulance":
            safety_tip = "Stay calm. Do not eat or drink anything."
        elif intent == "women_safety":
            safety_tip = "Stay on the line. Move to a crowded area if you can."

        if intent == "unknown":
            return "I cannot provide medical or legal advice. For emergencies, please say 'Police', 'Ambulance', or 'Fire'."
            
        if helpline:
            # High Urgency or Low Urgency: ALWAYS ask for confirmation.
            # Never auto-dial in the speech response (Frontend handles the actual dial logic).
            return f"I have located {helpline['name']}. {safety_tip} Shall I call them for you?"
        else:
            return f"I detected a {intent} situation. {safety_tip} Please dial 112 immediately."

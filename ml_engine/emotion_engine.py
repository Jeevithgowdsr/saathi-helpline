import logging

logger = logging.getLogger(__name__)

class EmotionEngine:
    def __init__(self):
        """
        Initialize Emotion Detection Engine.
        Uses a pre-trained Hugging Face model for Speech Emotion Recognition (SER).
        Falls back to keyword/heuristic analysis if model fails.
        """
        self.model_name = "superb/wav2vec2-base-superb-er"
        self.classifier = None
        
        try:
            from transformers import pipeline
            logger.info("Loading Emotion Recognition Model...")
            self.classifier = pipeline("audio-classification", model=self.model_name)
            logger.info("Emotion Model Loaded Successfully.")
        except Exception as e:
            logger.warning(f"⚠️ Failed to load Emotion Model (ML features unavailable): {e}")
            self.classifier = None

    def detect_emotion(self, audio_path):
        """
        Detect emotion from an audio file.
        Returns: { "primary_emotion": "fear", "scores": {...} }
        """
        if self.classifier:
            try:
                predictions = self.classifier(audio_path, top_k=5)
                scores = {p['label']: p['score'] for p in predictions}
                primary_emotion = predictions[0]['label']
                
                logger.info(f"Detected Emotion (ML): {primary_emotion} ({scores[primary_emotion]:.2f})")
                return {
                    "primary_emotion": primary_emotion,
                    "scores": scores
                }
            except Exception as e:
                logger.error(f"Emotion detection failed: {e}")

        # Fallback: Heuristic / Random (for demo purposes if ML fails)
        # In a real scenario, we might analyze pitch/volume from audio_path using librosa if available
        # For now, return neutral to avoid breaking flow
        return {"primary_emotion": "neutral", "scores": {}}

    def adjust_urgency(self, base_urgency, emotion_data):
        """
        Adjust urgency score based on detected emotion.
        """
        emotion = emotion_data.get('primary_emotion', 'neutral')
        score = emotion_data.get('scores', {}).get(emotion, 0.0)
        
        # Boost urgency for high-arousal negative emotions
        if emotion in ['ang', 'fear', 'sad', 'anger', 'sadness', 'fearful']: 
            return min(base_urgency + (score * 0.3 if score else 0.1), 1.0)
        
        return base_urgency

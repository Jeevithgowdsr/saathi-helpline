import json
import math
import re
import os
from collections import defaultdict

class EmergencyNLPModel:
    def __init__(self):
        self.class_counts = defaultdict(int)
        self.word_counts = defaultdict(lambda: defaultdict(int))
        self.vocab = set()
        self.total_docs = 0
        self.classes = set()

    def train(self, data_path):
        """Trains a Naive Bayes classifier on the provided JSON dataset."""
        print(f"🔄 Training model on {data_path}...")
        
        with open(data_path, 'r') as f:
            data = json.load(f)

        for entry in data:
            label = entry['label']
            text = entry['text']
            
            self.class_counts[label] += 1
            self.total_docs += 1
            self.classes.add(label)
            
            words = self._tokenize(text)
            for word in words:
                self.vocab.add(word)
                self.word_counts[label][word] += 1
        
        print(f"✅ Training complete. Vocab size: {len(self.vocab)}, Classes: {len(self.classes)}")

    def _tokenize(self, text):
        """Simple tokenizer: lowercase and remove non-alphanumeric."""
        text = text.lower()
        text = re.sub(r'[^a-z0-9\s]', '', text)
        return text.split()

    def predict(self, text):
        """Predicts the class and confidence score for the given text."""
        words = self._tokenize(text)
        scores = {}
        
        # Calculate Log Likelihoods
        for label in self.classes:
            # P(Class)
            log_prob = math.log(self.class_counts[label] / self.total_docs)
            
            # P(Word | Class)
            total_words_in_class = sum(self.word_counts[label].values())
            vocab_size = len(self.vocab)
            
            for word in words:
                # Laplace Smoothing (+1)
                word_count = self.word_counts[label].get(word, 0) + 1
                word_prob = word_count / (total_words_in_class + vocab_size)
                log_prob += math.log(word_prob)
            
            scores[label] = log_prob

        # Convert Log Scores to Probabilities (Softmax-ish)
        # 1. Shift scores to avoid overflow/underflow
        max_score = max(scores.values())
        exp_scores = {k: math.exp(v - max_score) for k, v in scores.items()}
        total_exp = sum(exp_scores.values())
        
        # 2. Normalize
        confidence_scores = {k: (v / total_exp) for k, v in exp_scores.items()}
        
        # Get best match
        best_label = max(confidence_scores, key=confidence_scores.get)
        best_score = confidence_scores[best_label]

        return {
            "label": best_label,
            "confidence": round(best_score, 4),
            "all_scores": {k: round(v, 4) for k, v in sorted(confidence_scores.items(), key=lambda item: item[1], reverse=True)}
        }

# --- Usage Example ---
if __name__ == "__main__":
    # Initialize and Train
    model = EmergencyNLPModel()
    
    # Path to training data
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, 'training_data.json')
    
    model.train(data_path)

    # Test Cases
    test_inputs = [
        "I want to kill myself, I can't take this anymore.",
        "There is a fire in the kitchen!",
        "Someone stole my credit card details online.",
        "A car just hit a bike, the rider is unconscious.",
        "My husband is beating me again."
    ]

    print("\n🔍 --- Prediction Results ---")
    for text in test_inputs:
        result = model.predict(text)
        print(f"\n📝 Input: '{text}'")
        print(f"🏷️  Prediction: {result['label']} (Confidence: {result['confidence']*100:.2f}%)")

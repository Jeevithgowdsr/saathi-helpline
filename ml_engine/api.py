import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

# Import our engines
from recommendation_engine import HelplineRecommender
from emergency_classifier import EmergencyNLPModel
from geo_engine import GeoLocationService
from routing_engine import RoutingEngine

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# --- Initialization ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. Initialize Recommender
recommender = HelplineRecommender(os.path.join(BASE_DIR, 'helplines.json'))

# 2. Initialize and Train Classifier
classifier = EmergencyNLPModel()

# 3. Initialize Geo Service
geo_service = GeoLocationService()

# 4. Initialize Routing Engine
routing_engine = RoutingEngine()

# 5. Initialize Risk Engine
from risk_engine import RiskEngine
risk_engine = RiskEngine()

# 6. Initialize Heatmap Engine
from heatmap_engine import HeatmapEngine
heatmap_engine = HeatmapEngine()

def prepare_and_train_classifier():
    """
    Loads the large generated dataset, adapts it to the classifier's expected format,
    and trains the model.
    """
    dataset_path = os.path.join(BASE_DIR, 'emergency_dataset.json')
    training_path = os.path.join(BASE_DIR, 'training_data.json') # Fallback
    
    # Check if the large dataset exists
    if os.path.exists(dataset_path):
        print(f"🚀 Loading large dataset from {dataset_path}...")
        with open(dataset_path, 'r') as f:
            raw_data = json.load(f)
            
        # Adapt format: user_message -> text, crisis_label -> label
        adapted_data = []
        for entry in raw_data:
            adapted_data.append({
                "text": entry['user_message'],
                "label": entry['crisis_label']
            })
            
        # Save temporary adapted file for the classifier to read
        temp_path = os.path.join(BASE_DIR, 'temp_training.json')
        with open(temp_path, 'w') as f:
            json.dump(adapted_data, f)
            
        classifier.train(temp_path)
        
        # Clean up
        try:
            os.remove(temp_path)
        except:
            pass
    else:
        print(f"⚠️ Large dataset not found. Falling back to small training data.")
        classifier.train(training_path)

# Train on startup
prepare_and_train_classifier()

# --- Endpoints ---

@app.route('/classify', methods=['POST'])
def classify_message():
    """
    Endpoint to classify an emergency message.
    Input: { "message": "I feel suicidal" }
    """
    data = request.json
    message = data.get('message', '')
    
    if not message:
        return jsonify({"error": "Message is required"}), 400

    prediction = classifier.predict(message)
    
    return jsonify({
        "category": prediction['label'],
        "confidence_score": prediction['confidence'],
        "all_scores": prediction['all_scores'],
        "explanation_text": f"Classified as {prediction['label']} with {prediction['confidence']*100:.1f}% confidence based on keywords."
    })

@app.route('/recommend', methods=['POST'])
def recommend_helplines():
    """
    Endpoint to get helpline recommendations.
    Input: { 
        "message": "...", 
        "location": "...", 
        "emergency_type": "..." (optional, can be inferred)
    }
    """
    data = request.json
    message = data.get('message', '')
    location = data.get('location', 'India')
    emergency_type = data.get('emergency_type')

    # 1. If emergency_type is not provided, infer it using the classifier
    inferred_data = None
    if not emergency_type:
        prediction = classifier.predict(message)
        emergency_type = prediction['label']
        inferred_data = {
            "inferred_category": emergency_type,
            "confidence": prediction['confidence']
        }

    # 2. Get Recommendations
    user_lat = data.get('lat')
    user_lon = data.get('lon')
    
    recommendations = recommender.recommend(
        user_message=message,
        location=location,
        emergency_type=emergency_type,
        user_lat=user_lat,
        user_lon=user_lon
    )

    # 3. Format Response
    response = {
        "input_analysis": {
            "message": message,
            "detected_location": location,
            "category": emergency_type,
            "is_inferred": bool(inferred_data),
            "classification_confidence": inferred_data['confidence'] if inferred_data else 1.0
        },
        "recommendations": []
    }

    for rec in recommendations:
        response["recommendations"].append({
            "helpline_id": rec['helpline']['id'],
            "name": rec['helpline']['name'],
            "number": rec['helpline']['number'],
            "category": rec['helpline']['category'],
            "recommendation_score": round(rec['score'], 2),
            "distance_km": rec['distance_km'],
            "explanation_text": rec['reason']
        })

    return jsonify(response)

# --- Firebase Auth Middleware ---
import firebase_admin
from firebase_admin import auth, credentials

# Initialize Firebase Admin (Mock if no credentials)
try:
    # In production, provide path to serviceAccountKey.json
    # cred = credentials.Certificate("path/to/serviceAccountKey.json")
    # firebase_admin.initialize_app(cred)
    firebase_admin.initialize_app()
    print("🔥 Firebase Admin Initialized")
except Exception as e:
    print(f"⚠️ Firebase Admin Init Failed (Expected in Dev without keys): {e}")

def verify_firebase_token(f):
    """Decorator to verify Firebase ID Token"""
    def wrapper(*args, **kwargs):
        # For development without frontend token sending, we can bypass or mock
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            # In production, return 401. For dev, we allow it.
            # return jsonify({"error": "No Authorization header"}), 401
            pass
        
        try:
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split("Bearer ")[1]
                # decoded_token = auth.verify_id_token(token)
                # request.user = decoded_token
        except Exception as e:
            print(f"Auth Error: {e}")
            return jsonify({"error": "Invalid Token"}), 401
            
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

# --- GeoJSON Helpers ---
def to_geojson_feature(geometry, properties):
    return {
        "type": "Feature",
        "geometry": geometry,
        "properties": properties
    }

def to_geojson_collection(features):
    return {
        "type": "FeatureCollection",
        "features": features
    }

# --- Endpoints ---

@app.route('/nearby', methods=['POST'])
@verify_firebase_token
def get_nearby_services():
    """
    Endpoint to find nearest emergency services.
    Returns GeoJSON FeatureCollection.
    """
    data = request.json
    lat = data.get('lat')
    lon = data.get('lon')
    
    if lat is None or lon is None:
        return jsonify({"error": "Latitude and Longitude required"}), 400
        
    try:
        lat = float(lat)
        lon = float(lon)
    except ValueError:
        return jsonify({"error": "Invalid coordinates"}), 400

    raw_results = geo_service.find_nearby_services(lat, lon)
    
    # Convert to GeoJSON
    features = []
    for category, details in raw_results.items():
        feature = to_geojson_feature(
            geometry={
                "type": "Point",
                "coordinates": [details['coordinates']['lon'], details['coordinates']['lat']]
            },
            properties={
                "type": category,
                "name": details['name'],
                "distance_km": details['distance_km'],
                "eta_minutes": details['eta_minutes'],
                "rating": details['rating'],
                "availability": details['availability_status']
            }
        )
        features.append(feature)
        
    return jsonify(to_geojson_collection(features))

@app.route('/route', methods=['POST'])
@verify_firebase_token
def get_route():
    """
    Endpoint to get emergency route.
    Returns GeoJSON LineString.
    """
    data = request.json
    try:
        route = routing_engine.calculate_route(
            start_lat=float(data['start_lat']),
            start_lon=float(data['start_lon']),
            end_lat=float(data['end_lat']),
            end_lon=float(data['end_lon']),
            mode=data.get('mode', 'driving')
        )
        
        # Convert polyline [[lat, lon], ...] to GeoJSON coordinates [[lon, lat], ...]
        geojson_coords = [[p[1], p[0]] for p in route['polyline']]
        
        feature = to_geojson_feature(
            geometry={
                "type": "LineString",
                "coordinates": geojson_coords
            },
            properties={
                "mode": route['mode'],
                "total_distance": route['total_distance'],
                "total_time": route['total_time'],
                "instructions": route['instructions_array']
            }
        )
        
        return jsonify(feature)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/heatmap', methods=['POST'])
@verify_firebase_token
def get_heatmap_data():
    """
    Endpoint to get heatmap data.
    Returns GeoJSON FeatureCollection of Points with intensity.
    """
    data = request.json
    lat = data.get('lat')
    lon = data.get('lon')
    
    if lat is None or lon is None:
        return jsonify({"error": "Latitude and Longitude required"}), 400
        
    try:
        lat = float(lat)
        lon = float(lon)
    except ValueError:
        return jsonify({"error": "Invalid coordinates"}), 400

    points = heatmap_engine.generate_heatmap_data(lat, lon)
    
    features = []
    for p in points:
        features.append(to_geojson_feature(
            geometry={
                "type": "Point",
                "coordinates": [p['lon'], p['lat']]
            },
            properties={
                "intensity": p['intensity'],
                "type": p['type'],
                "timestamp": p['timestamp']
            }
        ))
        
    return jsonify(to_geojson_collection(features))

@app.route('/alerts', methods=['POST'])
@verify_firebase_token
def get_alerts():
    """
    Endpoint to check risk zones.
    Returns GeoJSON FeatureCollection of Polygons/Points (Zones).
    """
    data = request.json
    lat = data.get('lat')
    lon = data.get('lon')
    
    if lat is None or lon is None:
        return jsonify({"error": "Latitude and Longitude required"}), 400
        
    try:
        lat = float(lat)
        lon = float(lon)
    except ValueError:
        return jsonify({"error": "Invalid coordinates"}), 400

    alerts = risk_engine.check_risks(lat, lon)
    
    features = []
    for alert in alerts:
        # Mocking a circle polygon or just a point for the zone center
        features.append(to_geojson_feature(
            geometry={
                "type": "Point",
                "coordinates": [lon, lat] # Simplified: Alert at user location or zone center
            },
            properties=alert
        ))
        
    return jsonify(to_geojson_collection(features))

@app.route('/helplines', methods=['GET'])
def get_all_helplines():
    """Returns all available helplines."""
    return jsonify(recommender.helplines)

@app.route('/feedback', methods=['POST'])
def submit_feedback():
    """
    Endpoint to collect user feedback for RLHF (Reinforcement Learning from Human Feedback).
    Input: { "message": "...", "selected_helpline": "...", "rating": 5 }
    """
    data = request.json
    # In a real app, save this to a database (Firebase/SQL)
    # For now, we'll just log it
    print(f"📝 FEEDBACK RECEIVED: {json.dumps(data)}")
    
    return jsonify({
        "status": "success",
        "message": "Feedback recorded. Thank you for helping us improve."
    })

# 7. Initialize Audio Engine
from audio_engine import AudioEngine
audio_engine = None
try:
    # Initialize with a small model for speed on CPU
    audio_engine = AudioEngine(model_size="tiny", device="cpu")
except Exception as e:
    print(f"⚠️ Audio Engine failed to load (Check dependencies): {e}")

# 8. Initialize Conversation Engine
from conversation_engine import ConversationEngine
conversation_engine = ConversationEngine(classifier, recommender)

# 9. Initialize Emotion Engine
from emotion_engine import EmotionEngine
emotion_engine = None
try:
    emotion_engine = EmotionEngine()
except Exception as e:
    print(f"⚠️ Emotion Engine failed to load: {e}")

# 11. Initialize TTS Engine
from tts_engine import TTSEngine
tts_engine = TTSEngine()

# --- Voice Assistant Endpoint ---

@app.route('/voice-assist', methods=['POST'])
@verify_firebase_token
def voice_assistant():
    """
    Endpoint for Voice Assistant.
    Supports both Text (JSON) and Audio (Multipart).
    """
    text = ""
    lang = 'en'
    user_lat = None
    user_lon = None
    emotion_data = {"primary_emotion": "neutral", "scores": {}}

    # Handle Multipart (Audio + Text)
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        lang = request.form.get('lang', 'en')
        user_lat = request.form.get('lat')
        user_lon = request.form.get('lon')
        text = request.form.get('text', '') # Fallback text from frontend

        if 'audio' in request.files and audio_engine:
            file = request.files['audio']
            temp_filename = f"temp_{os.urandom(4).hex()}.wav"
            temp_path = os.path.join(BASE_DIR, temp_filename)
            try:
                file.save(temp_path)
                
                # 1. Transcribe
                result = audio_engine.transcribe(temp_path)
                if "error" not in result:
                    text = result['text'] # Override fallback text if successful
                    print(f"🎙️ Transcribed: {text}")
                else:
                    print(f"⚠️ Transcription failed, using fallback text: {result['error']}")
                
                # 2. Detect Emotion (if engine loaded)
                if emotion_engine:
                    emotion_data = emotion_engine.detect_emotion(temp_path)
                    
            except Exception as e:
                print(f"⚠️ Audio processing error: {e}")
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
    else:
        # Handle JSON (Text only)
        data = request.json
        text = data.get('text', '')
        lang = data.get('lang', 'en')
        user_lat = data.get('lat')
        user_lon = data.get('lon')

    if not text:
        return jsonify({"error": "No speech detected"}), 400
    # 3. Translate to English (if needed)
    detected_lang = lang
    if lang == 'auto' or lang != 'en':
        translation = translation_engine.translate(text, target_lang='en')
        english_text = translation['translated_text']
        detected_lang = translation['src_lang']
    else:
        english_text = text

    # 4. Crisis Classification & Response Generation
    response_data = conversation_engine.process_query(english_text, user_lat, user_lon)
    
    # Adjust Urgency based on Emotion (if available)
    if emotion_engine:
        response_data['urgency'] = emotion_engine.adjust_urgency(response_data['urgency'], emotion_data)
        # Regenerate response if urgency changed significantly? 
        # For now, we keep the text response but the TTS will pick up the new urgency score.

    # 5. Translate Response back to User's Language
    spoken_reply_en = response_data['response']
    spoken_reply_final = spoken_reply_en
    
    if detected_lang != 'en':
        reply_trans = translation_engine.translate(spoken_reply_en, target_lang=detected_lang)
        spoken_reply_final = reply_trans['translated_text']

    # 6. Generate TTS Audio (with urgency tone)
    audio_base64 = tts_engine.generate_sync(
        spoken_reply_final, 
        lang=detected_lang, 
        urgency=response_data['urgency']
    )
    
    # Construct Final Response
    final_response = {
        "crisis_label": response_data['intent'],
        "recommended_helpline": response_data['helpline'],
        "confidence_score": response_data['confidence'],
        "urgency_score": response_data['urgency'],
        "emotion": emotion_data,
        "spoken_reply": spoken_reply_final,
        "audio_base64": audio_base64,
        "original_text": text,
        "translated_text": english_text,
        "detected_lang": detected_lang
    }

    return jsonify(final_response)



@app.route('/send-sms', methods=['POST'])
@verify_firebase_token
def send_sms():
    """
    Simulate sending an SMS.
    In production, integrate with Twilio, SNS, or Firebase.
    """
    data = request.json
    phone = data.get('phone')
    message = data.get('message')
    
    if not phone or not message:
        return jsonify({"error": "Missing phone or message"}), 400
        
    print(f"📨 [SMS SIMULATION] To: {phone} | Msg: {message}")
    
    return jsonify({"status": "sent", "provider": "simulation"})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "online", "model_vocab_size": len(classifier.vocab)})

@app.route('/news', methods=['GET'])
def get_crime_news():
    try:
        location = request.args.get('location', 'Karnataka')
        # In a real app, integrate NewsAPI.org or GDELT here.
        # Example: url = f"https://newsapi.org/v2/everything?q=crime+{location}&apiKey=YOUR_KEY"
        
        # Simulated Data for Demo
        import random
        from datetime import datetime, timedelta
        
        types = ["Theft", "Traffic Accident", "Cybercrime", "Vandalism", "Safety Alert"]
        locs = ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"] if location == 'Karnataka' else [location]
        
        news_items = []
        for i in range(6):
            date = datetime.now() - timedelta(days=random.randint(0, 6), hours=random.randint(0, 23))
            t = random.choice(types)
            l = random.choice(locs)
            
            news_items.append({
                "id": i,
                "title": f"Reported {t} incident in {l}",
                "description": f"Authorities utilize Saathi Helpline to respond to a reported {t.lower()} near {l} main district. Citizens advised to stay cautious.",
                "source": "Local Police Feed",
                "publishedAt": date.strftime("%Y-%m-%d %H:%M"),
                "imageUrl": f"https://source.unsplash.com/400x300/?police,{t.lower()}", # Unsplash source for placeholder
                "url": "#"
            })
            
        return jsonify({"status": "success", "articles": news_items})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🚀 Saathi ML API is running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)

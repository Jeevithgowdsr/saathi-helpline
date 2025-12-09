import json
import csv
import random
import os

# Configuration
NUM_EXAMPLES = 2500
OUTPUT_JSON = 'emergency_dataset.json'
OUTPUT_CSV = 'emergency_dataset.csv'

# Data Definitions
categories = {
    "Mental Health Crisis": {
        "helpline_id": "mental_health",
        "severity_range": (3, 5),
        "templates": [
            "I feel {feeling} and {thought}.",
            "I want to {action}, I can't take it anymore.",
            "Having severe {condition}, please help.",
            "My friend is talking about {action}, I'm scared.",
            "I am extremely {feeling} and thinking of {action}.",
            "Everything feels {adjective}, I just want to {action}.",
            "I need someone to talk to, I am {feeling}."
        ],
        "fillers": {
            "feeling": ["depressed", "lonely", "anxious", "hopeless", "suicidal", "empty", "worthless", "trapped"],
            "thought": ["don't see a way out", "want to end it all", "nobody cares", "I am a burden"],
            "action": ["killing myself", "suicide", "ending my life", "jumping off", "taking pills", "cutting myself"],
            "condition": ["panic attacks", "anxiety", "depression", "breakdown", "hallucinations"],
            "adjective": ["dark", "pointless", "unbearable", "painful"]
        }
    },
    "Women Safety": {
        "helpline_id": "women_1091",
        "severity_range": (3, 5),
        "templates": [
            "Someone is {action} me.",
            "I am being {action} by a {person} at {place}.",
            "A man is {action} me and I feel unsafe.",
            "Please help, I am alone and {person} is {action} me.",
            "I think I am being {action}, he is following me.",
            "Need help immediately at {place}, {person} is trying to {action} me."
        ],
        "fillers": {
            "action": ["following", "stalking", "harassing", "chasing", "threatening", "touching", "abusing"],
            "person": ["stranger", "guy", "man", "group of men", "driver"],
            "place": ["the bus stop", "metro station", "dark street", "park", "office", "cab"]
        }
    },
    "Fire Emergency": {
        "helpline_id": "fire_101",
        "severity_range": (5, 5),
        "templates": [
            "There is a {size} fire at {place}!",
            "Help! The {place} is on fire!",
            "I see {visual} coming from the {place}.",
            "Fire broke out in the {place}, people are trapped.",
            "Call the fire brigade! {place} is burning.",
            "Electric short circuit caused a fire in {place}."
        ],
        "fillers": {
            "size": ["huge", "massive", "small", "spreading"],
            "place": ["kitchen", "building", "apartment", "office", "factory", "slum area", "market", "school"],
            "visual": ["thick smoke", "flames", "sparks"]
        }
    },
    "Road Accident": {
        "helpline_id": "ambulance_108",
        "severity_range": (4, 5),
        "templates": [
            "A {vehicle} hit a {victim} at {location}.",
            "Bad accident on the {location}, {condition}.",
            "Two cars crashed, people are {condition}.",
            "Need ambulance immediately at {location}, {vehicle} accident.",
            "Hit and run case at {location}, victim is {condition}."
        ],
        "fillers": {
            "vehicle": ["car", "bike", "truck", "bus"],
            "victim": ["pedestrian", "biker", "child", "old man"],
            "location": ["highway", "main road", "junction", "crossing", "bridge"],
            "condition": ["bleeding heavily", "unconscious", "injured", "stuck inside", "not moving"]
        }
    },
    "Domestic Violence": {
        "helpline_id": "women_1091",
        "severity_range": (3, 5),
        "templates": [
            "My {relation} is {action} me.",
            "Domestic violence happening at my neighbor's house, he is {action} her.",
            "I am scared of my {relation}, he is {action} me.",
            "He is drunk and {action} me and the kids.",
            "Please save me, my {relation} is trying to {action} me."
        ],
        "fillers": {
            "relation": ["husband", "father", "partner", "brother-in-law"],
            "action": ["beating", "hitting", "threatening", "abusing", "throwing things at", "locking"]
        }
    },
    "Child Helpline": {
        "helpline_id": "child_1098",
        "severity_range": (3, 5),
        "templates": [
            "I found a {child} who is {condition} at {place}.",
            "A child is being {action} in the {place}.",
            "Reporting child labor at {place}, {child} is working there.",
            "I suspect child abuse next door, the {child} is always {condition}.",
            "Lost child found at {place}, looks {condition}."
        ],
        "fillers": {
            "child": ["little boy", "little girl", "baby", "kid", "minor"],
            "condition": ["crying", "lost", "injured", "scared", "hungry", "bruised"],
            "place": ["park", "railway station", "shop", "factory", "street", "temple"],
            "action": ["beaten", "forced to beg", "working", "trafficked"]
        }
    },
    "Cyber Crime": {
        "helpline_id": "cyber_1930",
        "severity_range": (1, 3),
        "templates": [
            "Someone {action} my {account}.",
            "I received a {type} asking for {item}.",
            "My photos are being {action} on {platform}.",
            "Lost money from my bank account due to {type}.",
            "Reporting a {type} scam, they stole my {item}."
        ],
        "fillers": {
            "action": ["hacked", "blocked", "morphed", "shared", "leaked"],
            "account": ["bank account", "instagram", "facebook", "email", "phone"],
            "type": ["fake call", "phishing link", "fraud message", "lottery scam", "UPI fraud"],
            "item": ["money", "OTP", "password", "details", "identity"],
            "platform": ["social media", "internet", "whatsapp", "telegram"]
        }
    }
}

def generate_message(category):
    data = categories[category]
    template = random.choice(data["templates"])
    
    # Fill template
    message = template
    for key, values in data["fillers"].items():
        if "{" + key + "}" in message:
            message = message.replace("{" + key + "}", random.choice(values))
            
    # Add random noise/urgency sometimes
    urgency_prefixes = ["Help!", "Please help.", "Emergency!", "Urgent.", ""]
    urgency_suffixes = ["Please hurry.", "I am scared.", "Call police.", "Need help now.", ""]
    
    if random.random() > 0.7:
        message = f"{random.choice(urgency_prefixes)} {message}"
    if random.random() > 0.7:
        message = f"{message} {random.choice(urgency_suffixes)}"
        
    return message.strip()

def main():
    dataset = []
    
    print(f"🔄 Generating {NUM_EXAMPLES} realistic examples...")
    
    for _ in range(NUM_EXAMPLES):
        category = random.choice(list(categories.keys()))
        cat_data = categories[category]
        
        message = generate_message(category)
        severity = random.randint(cat_data["severity_range"][0], cat_data["severity_range"][1])
        
        dataset.append({
            "user_message": message,
            "crisis_label": category,
            "severity_level": severity,
            "suggested_helpline_id": cat_data["helpline_id"]
        })
        
    # Save JSON
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, OUTPUT_JSON)
    csv_path = os.path.join(base_dir, OUTPUT_CSV)
    
    with open(json_path, 'w') as f:
        json.dump(dataset, f, indent=2)
        
    # Save CSV
    with open(csv_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["user_message", "crisis_label", "severity_level", "suggested_helpline_id"])
        writer.writeheader()
        writer.writerows(dataset)
        
    print(f"✅ Dataset generated successfully!")
    print(f"📄 JSON: {json_path}")
    print(f"📊 CSV: {csv_path}")

if __name__ == "__main__":
    main()

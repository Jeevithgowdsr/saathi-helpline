import requests
import json

url = "http://localhost:5000/recommend"

# Test Case: User in Bangalore (near Police HQ) asking for help
payload = {
    "message": "I need police help immediately",
    "location": "Bangalore",
    "lat": 12.9720,
    "lon": 77.5950
}

try:
    response = requests.post(url, json=payload)
    print("Status Code:", response.status_code)
    print("Response:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print("Error:", e)

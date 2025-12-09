# Saathi Helpline - Emergency Assistant App

Saathi Helpline is a comprehensive emergency assistance application designed to provide immediate help during critical situations. It integrates a React frontend, a Node.js backend, and a Python-based ML Engine for advanced AI features.

## 🌟 Key Features

### 🛡️ Core Safety
*   **Emergency Map**: Real-time tracking of nearby Police, Hospitals, and Fire Stations with navigation.
*   **Panic Mode**: One-tap SOS that sends SMS with location to emergency contacts and records audio/video.
*   **Safety Alert System**: Real-time alerts for crime hotspots, accident zones, and weather warnings based on your location.
*   **Offline Support**: Essential features work even without internet access.

### 🤖 AI Powered (ML Engine)
*   **Saathi Assistant**: An empathetic AI chatbot that provides emotional support and safety advice.
*   **Voice Assistant**: Hands-free voice commands ("Help me", "Find hospital") for emergencies.
*   **Smart Helpline Finder**: Search for helplines using natural language (e.g., "I lost my credit card").
*   **Crime & Safety Watch**: Live updates on safety incidents and crime reports in your area.

### 👮 Admin & Agency Portal
*   **Dashboard**: For agencies to manage alerts, view reports, and analytics.
*   **Incident Management**: Track and resolve reported incidents.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (v3.9+)
*   MongoDB (Compass or Atlas)

### 1. Installation

**Frontend & Node Backend:**
```bash
npm install
cd saathi-backend
npm install
cd ..
```

**ML Engine (Python):**
```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r ml_engine/requirements.txt
```

### 2. Running the App

You can run each service in a separate terminal:

**Terminal 1: Node.js Backend**
```bash
cd saathi-backend
node server.js
```

**Terminal 2: Python ML Engine**
```bash
.\.venv\Scripts\activate
python ml_engine/api.py
```

**Terminal 3: React Frontend**
```bash
npm start
```

*   **Frontend**: http://localhost:3000
*   **Node Backend**: http://localhost:5000
*   **ML API**: http://localhost:5001

## 🛠️ Tech Stack
*   **Frontend**: React, TailwindCSS, Leaflet (Maps), Lucide Icons
*   **Backend**: Node.js, Express, MongoDB
*   **AI/ML**: Python, Flask, Sentence-Transformers, Torch, SpeechRecognition
*   **Deployment**: Ready for Vercel (Front) & Render (Back)

---
*Stay Safe with Saathi.*

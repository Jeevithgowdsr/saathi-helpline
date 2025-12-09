---
description: Run the Saathi Helpline App (Frontend + ML Backend)
---

To run the full application with the Emergency Map, AI features, and Backend services, you need to run three components: Python ML Backend, Node.js Backend, and React Frontend.

1. **Install Python Dependencies** (First time only)
   ```powershell
   .\.venv\Scripts\python -m pip install -r ml_engine/requirements.txt
   ```

2. **Start the ML Backend (Port 5001)**
   This server powers the Map, Routing, and AI recommendations.
   ```powershell
   .\.venv\Scripts\python ml_engine/api.py
   ```
   *Keep this terminal open.*

3. **Start the Node.js Backend (Port 5000)**
   This server handles database connections and authentication.
   Open a **new terminal** and run:
   ```powershell
   cd saathi-backend
   npm install # First time only
   node server.js
   ```
   *Keep this terminal open.*

4. **Start the React Frontend (Port 3000)**
   Open a **new terminal** and run:
   ```powershell
   npm install # First time only
   npm start
   ```

The app will open at `http://localhost:3000`.
The frontend connects to the ML Engine at `http://localhost:5001` and the Node Backend at `http://localhost:5000`.

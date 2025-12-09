---
description: How to Deploy Saathi Helpline App
---

# Deploy Saathi Helpline App

This guide will help you deploy the Saathi Helpline app to the web. The app consists of three parts:
1.  **React Frontend** (User Interface)
2.  **Node.js Backend** (Database & Auth)
3.  **Python ML Engine** (AI & Map Features)

You will need to deploy these separately. We recommend using **Vercel** for the frontend and **Render** or **Railway** for the backends.

## Prerequisites
-   A GitHub account (push this code to a repository).
-   Accounts on Vercel and Render/Railway.

---

## 1. Deploy Node.js Backend

**Service**: [Render](https://render.com/) or [Railway](https://railway.app/)
**Directory**: `saathi-helpline/saathi-backend`

1.  Create a new **Web Service**.
2.  Connect your GitHub repository.
3.  **Root Directory**: `saathi-backend`
4.  **Build Command**: `npm install`
5.  **Start Command**: `node server.js`
6.  **Environment Variables**:
    *   `MONGO_URI`: Your MongoDB Connection String.
    *   `PORT`: `5000` (or let the platform decide).

Once deployed, copy the **URL** (e.g., `https://saathi-backend.onrender.com`).

---

## 2. Deploy Python ML Engine

**Service**: [Render](https://render.com/) (Recommended)
**Directory**: `saathi-helpline` (Root)

1.  Create a new **Web Service**.
2.  Connect your GitHub repository.
3.  **Root Directory**: `.` (Root)
4.  **Build Command**: `pip install -r ml_engine/requirements.txt`
5.  **Start Command**: `python ml_engine/api.py` (or `gunicorn ml_engine.api:app`)
    *   *Note*: For production, you may need `gunicorn`. Add `gunicorn` to `requirements.txt` and use: `gunicorn --chdir ml_engine api:app`
6.  **Environment Variables**:
    *   `PORT`: `5001` (platform usually sets this).

Once deployed, copy the **URL** (e.g., `https://saathi-ml.onrender.com`).

---

## 3. Deploy Frontend

**Service**: [Vercel](https://vercel.com/)
**Directory**: `saathi-helpline` (Root)

1.  Create a new project in Vercel.
2.  Connect your GitHub repository.
3.  **Root Directory**: `.` (Root)
4.  **Build Command**: `npm run build`
5.  **Environment Variables**:
    *   `REACT_APP_NODE_API_URL`: The URL from Step 1 (e.g., `https://saathi-backend.onrender.com`)
    *   `REACT_APP_ML_API_URL`: The URL from Step 2 (e.g., `https://saathi-ml.onrender.com`)

6.  Deploy!

---

## Local Development (Testing)

To run locally, you already have a `.env` file with:
```
REACT_APP_NODE_API_URL=http://localhost:5000
REACT_APP_ML_API_URL=http://localhost:5001
```

Just run the `run_saathi_app` workflow or the individual start commands.

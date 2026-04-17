# NexArena — Smart Stadium Management System

NexArena is an AI-powered, full-stack stadium management solution designed to enhance the live sports experience for both ticket-holders and stadium administrators via real-time data, AI-driven recommendations, and actionable security insights.

## Features

- **Authentication:** Role-based access control (User, Host, Admin) powered by Firebase Auth.
- **Real-Time Data:** Live WebSockets syncing between the FastAPI backend and React frontend.
- **Data Visualization:** Interactive components powered by `recharts`.
- **Backend:** Modular FastAPI handling simulated AI analytics, crowd density estimation, wait-times, and Firebase Admin functionality. 
- **Persisted Database:** Live events and alert history are stored securely via Firebase Firestore.

---

## Local Development Setup

### 1. Backend (FastAPI) Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server (Hot-reload enabled)
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*Note: Make sure to keep `serviceAccountKey.json` inside the backend directory for Firebase authenticating.*

### 2. Frontend (React/Vite) Setup
Ensure you are in the root directory.
```bash
# Install dependencies
npm install

# Run the Vite Dev Server
npm run dev
```

---

## Production Deployment

### Frontend (User Dashboard / Landing Page)
Deployable to **Vercel** via quick deployment:
1. Push codebase to GitHub.
2. Link repository to Vercel. 
3. `vercel.json` will automatically route traffic for correct SPAs (`/* -> /index.html`). 

### Backend (FastAPI Host/Analytics Server)
Configured for seamless deployment via **Railway**:
1. Push to GitHub.
2. Link the repository to Railway.
3. Automatically uses Nixpacks configuration set inside `railway.json` and the provided `Procfile`.
4. Ensure you inject the Firebase `serviceAccountKey` details into Railway environment variables.
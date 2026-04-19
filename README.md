# NexArena

NexArena is a smart stadium platform built with React, Vite, Tailwind, Firebase Auth, and FastAPI. It gives fans a live event dashboard with routing and queue awareness, while hosts get an operations console for crowd visibility, alerts, and venue control.

## Live Demo

- Frontend: https://nexarena-574930078384.us-central1.run.app
- Backend: https://nexarena-backend-574930078384.us-central1.run.app
- Health check: https://nexarena-backend-574930078384.us-central1.run.app/health

## Stack

- Frontend: React 18, Vite, Tailwind CSS, TypeScript
- Backend: FastAPI, Uvicorn, Firebase Admin
- Auth: Firebase Authentication
- Data: Cloud Firestore
- Deployment: Google Cloud Run

## Core Features

- Firebase email/password signup and login with fan and host roles
- Protected routes for fan and host dashboard flows
- Live crowd and alert streaming over WebSockets
- Fan dashboard for event entry, routing, and venue updates
- Host dashboard for event monitoring, broadcast alerts, and operations visibility
- Dark and light theme support with persisted preference
- Centralized API client with auth token attachment and error handling

## Repository Structure

```text
.
|- src/                 # React frontend
|- backend/             # FastAPI backend
|- Dockerfile           # Frontend Cloud Run container
|- backend/Dockerfile   # Backend Cloud Run container
`- README.md
```

## Local Development

### Prerequisites

- Node.js 20+
- Python 3.11+
- A Firebase project
- A Google Cloud project if you want to use Firestore-backed flows

### Frontend

Create a local `.env` file in the repo root:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/api/ws
```

Run the frontend:

```bash
npm install
npm run dev
```

### Backend

Run the backend from the `backend` directory:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

If you are using Firestore locally, authenticate with Google Cloud Application Default Credentials or set `GOOGLE_APPLICATION_CREDENTIALS` to a valid service-account JSON path.

## Production Notes

- The frontend and backend are deployed separately to Cloud Run.
- The backend uses `ALLOWED_ORIGINS` for CORS.
- Firestore must be enabled and initialized in the target GCP project.
- The backend exposes `/health` for deployment and uptime checks.

## Current Cloud Run Services

- `nexarena`
- `nexarena-backend`

Project:

- `nexarena-493308`

## Scripts

```bash
npm run dev
npm run build
npm run preview
npx eslint src --ext .js,.jsx,.ts,.tsx
```

## Notes

- This repository has been cleaned to reflect the active Cloud Run deployment path.
- Legacy generated artifacts, tracked secrets, and stale deployment configs were removed.

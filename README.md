# MIRRORA AI

A personal, solo-built workspace for transparent, consent-based face and voice experiences.

## Project structure

- `backend/` — FastAPI service and API routes.
- `frontend/` — React + Vite dashboard.
- `docker-compose.yml` — optional local PostgreSQL database.

## Run on Ubuntu

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend: http://127.0.0.1:8000  
API docs: http://127.0.0.1:8000/docs

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

### 3. Optional database

From the project root, copy `.env.example` to `.env`, change the local password, then run:

```bash
docker compose up -d
```

## Safety foundations

The product is intended only for the user's own identity or identities whose owners have explicitly agreed. Any synthetic face or voice use in calls must be clearly disclosed to participants. The project must include consent records, revocation/deletion controls, access protection, and secure handling of media before identity transformation features are implemented.

## Current stage

This is a foundation scaffold. Face, voice, consent, and calls modules are placeholders; no identity transformation or voice cloning is implemented yet. The next milestone is authentication and consent management.

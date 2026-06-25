# ResumeForge

Full-stack resume builder: **Django 5** + **React 18** + **Mistral AI**.

## Quick Start

```bash
# 1. Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your MISTRAL_API_KEY

# 2. Start both servers
bash start.sh
```

Or run manually in two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm start
```

App at http://localhost:3000 · API at http://localhost:8000

## Environment Variables (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | No (dev default provided) | Django secret key |
| `MISTRAL_API_KEY` | For AI features | Get at https://console.mistral.ai |

## Features

- Email-based registration & login (JWT with auto-refresh)
- Resume CRUD with 5 section types (Experience, Education, Skills, Projects, Certifications)
- Three resume templates: Modern, Classic, Minimal
- Live preview panel
- ✨ AI content generation via Mistral AI (summary, experience bullets, project descriptions)
- Profile management with avatar upload

## Auth Architecture

- JWT stored in `localStorage` (access + refresh tokens)
- `EmailOrUsernameBackend` — login accepts email OR username
- `CustomTokenObtainPairSerializer` — login response includes full user object
- Auto-refresh on 401 with queued request retry
- Refresh token blacklisted on logout

## Template Switching

Templates are stored as a `template` field on each `Resume` model (`modern` / `classic` / `minimal`).
Select via the **Template** tab in the builder — click Apply to persist it to the DB.

## AI Integration (Mistral AI)

Set `MISTRAL_API_KEY` in `backend/.env`, then use the **✨ AI** tab in the builder.
Choose content type (Summary / Experience / Project), tone, and a context description.
Generated text can be copied to clipboard and pasted into any field.

# Healthcare Dashboard

A full-stack patient management dashboard for a medical practice, built with **React (TypeScript)**, **FastAPI**, and **PostgreSQL**.

## Features

- Patient CRUD with pagination, search, sorting, and status filtering
- Clinical notes attached to patients with add/delete
- Template-based patient summary synthesis from profile + notes
- Responsive layout with header, sidebar, and main content area
- Form validation (client + server) with meaningful error messages
- Dark/light theme toggle
- Virtualized patient list for efficient rendering of large datasets
- Code splitting with lazy-loaded routes
- Docker Compose for one-command local setup
- Alembic migrations and API request logging (stretch goals)

## Tech Stack

| Layer | Choices |
|-------|---------|
| Frontend | Vite, React 18, TypeScript, TanStack Query, React Router, React Hook Form, Zod, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, Pydantic, Alembic |
| Database | PostgreSQL 16 |

## Quick Start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API docs:** http://localhost:8000/docs
- **Health check:** http://localhost:8000/health

The database is seeded with 20 sample patients on first startup.

## Local Development (without Docker)

### Prerequisites

- Node.js 20+
- Python 3.12+
- PostgreSQL 16+

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create database
createdb healthcare

# Run migrations (optional — app also creates tables on startup)
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the Vite dev server proxies `/api` to the backend.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/patients` | List patients (pagination, search, sort, filter) |
| GET | `/patients/{id}` | Get patient details |
| POST | `/patients` | Create patient |
| PUT | `/patients/{id}` | Update patient |
| DELETE | `/patients/{id}` | Delete patient |
| POST | `/patients/{id}/notes` | Add clinical note |
| GET | `/patients/{id}/notes` | List notes |
| DELETE | `/patients/{id}/notes/{note_id}` | Delete note |
| GET | `/patients/{id}/summary` | Patient summary |

### Query Parameters for `GET /patients`

- `page`, `page_size` — pagination
- `search` — name, email, or conditions
- `status` — filter by patient status
- `sort_by` — `name`, `age`, `last_visit`, `status`
- `sort_order` — `asc` or `desc`

## Testing

```bash
cd backend
pytest
```

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entry
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── routers/          # API routes
│   │   ├── services/         # Business logic (summary)
│   │   └── seed.py           # Sample data seeder
│   ├── alembic/              # Database migrations
│   └── tests/
├── frontend/
│   └── src/
│       ├── api/                # API client
│       ├── components/         # UI components
│       ├── pages/              # Route pages
│       └── schemas/            # Zod validation
├── docker-compose.yml
└── .env.example
```

## Environment Variables

See [`.env.example`](.env.example) for all configurable variables.

## Architecture Decisions

- **TanStack Query** for server state — handles caching, refetching, and optimistic updates without a global store
- **Debounced search** — non-blocking search input with 300ms debounce
- **Virtualization** — `@tanstack/react-virtual` for efficient list rendering at scale
- **Template-based summary** — deterministic, no external API dependency; easy to swap for an LLM later
- **Alembic** — reproducible schema migrations alongside startup `create_all` for convenience

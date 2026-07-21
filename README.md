# Calculator Web Site

A basic calculator web application with a Python/FastAPI backend API and a vanilla HTML/CSS/JS frontend.

## Architecture

- **Backend**: Python/FastAPI calculator API (port 8000)
- **Frontend**: Vanilla HTML/CSS/JS calculator UI (port 80, served by nginx)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/calculate` | Perform calculation `{operation, a, b}` -> `{result}` |
| GET | `/api/operations` | List available operations |
| GET | `/health` | Health check |

## Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
# Open index.html in browser, or serve with any static server
```

### Docker

```bash
docker-compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:8000

## Testing

### Backend (Pytest)

```bash
cd backend
pytest --cov=app --cov-report=xml
```

### Frontend (Jest)

```bash
cd frontend
npx jest --coverage
```

## CI/CD

GitHub Actions pipeline runs on push to `dev` branch:
- Backend: install deps, build, run pytest with coverage
- Frontend: install deps, run jest with coverage

## Tech Stack

- Backend: Python 3.11, FastAPI, Uvicorn
- Frontend: Vanilla HTML5, CSS3, JavaScript (ES6+)
- Testing: Pytest (backend), Jest (frontend)
- Containerization: Docker, docker-compose

# Repository Guidelines

## Project Structure & Module Organization
- `backend/` contains the FastAPI service. The main package lives in `backend/backend/`, with `app/` (API, schema, service, crud, model), `common/`, `core/`, `middleware/`, `plugin/`, and `alembic/` for migrations.
- Backend tests live under `backend/backend/app/admin/tests` with `test_*.py` naming.
- `frontend/` is the Vue 3 + Vite app. Core code is in `frontend/src/` with `pages/` (auto-routed views), `components/`, `assets/`, `stores/`, `services/`, and `composables/`.

## Build, Test, and Development Commands
Backend (run from `backend/`):
- `uv sync` installs dependencies from `pyproject.toml` and `uv.lock`.
- `python backend/run.py` starts the dev server with auto-reload.
- `pytest` runs backend tests.
- `bash backend/scripts/lint.sh` runs repo lint checks (prek).
- `bash backend/scripts/format.sh` checks formatting with Ruff.
- `docker compose -f docker-compose.yml up` starts the full backend stack (DB, Redis, RabbitMQ, server).

Frontend (run from `frontend/`):
- `pnpm install` installs dependencies.
- `pnpm dev` runs the dev server.
- `pnpm build` creates a production build.
- `pnpm preview` serves the production build locally.
- `pnpm lint` runs `oxlint` and `oxfmt`.

## Coding Style & Naming Conventions
- Python: 4-space indentation, Ruff formatting (line length 120, single quotes). Type annotations are enforced by Ruff rules. Use `snake_case` for modules/functions and `PascalCase` for classes.
- Frontend: TypeScript + Vue SFCs linted by `oxlint/oxfmt`. Use `kebab-case` for `.vue` filenames and `use-*.ts` for composables (see `frontend/src/composables/`).

## Testing Guidelines
- Backend uses `pytest`. Add tests next to existing suites in `backend/backend/app/admin/tests`, following `test_*.py` naming.
- No frontend test runner is configured in `frontend/package.json`; add one only if a feature demands it.

## Commit & Pull Request Guidelines
- Git history is short and informal; recent subjects include `refactor: ...` and `update`. Use concise, descriptive subjects; prefer `type: summary` when helpful.
- PRs should include a summary, testing notes, linked issues, and screenshots or gifs for UI changes.

## Configuration & Secrets
- Copy `.env` templates before running locally: `backend/backend/.env.example` and `frontend/.env.example`.
- Keep real credentials and API keys out of Git history.

## Architecture Overview
- Backend follows a pseudo three-tier flow: API routes -> schema -> service -> CRUD -> model.
